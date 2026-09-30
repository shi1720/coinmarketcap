import { workspaceSchema, type Workspace } from '../lib/workspace.ts';
import { analyzeTreasury } from '../lib/analysis.ts';
import type { MarketSnapshot } from '../lib/market-types';
import type { DecisionRecord } from '../lib/report';

export class TransportError extends Error {
  status: number;
  constructor(message: string, status = 503) { super(message); this.status = status; }
}
export interface PrivateStore {
  getWorkspace(): Promise<{ workspace: Workspace | null; revision: number }>;
  saveWorkspace(workspace: Workspace, expectedRevision: number): Promise<{ revision: number; updatedAt: string }>;
  listReports(): Promise<{ id: string; created_at: string }[]>;
  getReport(id: string): Promise<DecisionRecord | null>;
  createReport(record: DecisionRecord): Promise<void>;
}
export function makeLocalReport(workspace: unknown, market: MarketSnapshot, now = new Date().toISOString()): DecisionRecord {
  const parsed = workspaceSchema.safeParse(workspace);
  if (!parsed.success) throw new TransportError('Invalid workspace inputs.', 400);
  if (!parsed.data.config.monthlyBurn && !parsed.data.obligations.some(o => o.amount > 0)) throw new TransportError('Add operating commitments before creating a record.', 422);
  if (market.cache === 'stale' || market.error) throw new TransportError('Refresh live prices before saving a decision record.', 503);
  const analysis = analyzeTreasury({ ...parsed.data, quotes: market.quotes, asOf: now });
  if (analysis.readiness === 'blocked' || analysis.warnings.some(w => w.code === 'STALE_QUOTE')) throw new TransportError('Resolve incomplete inputs or stale quotes before saving.', 422);
  analysis.assumptions.push('Calculated locally in the browser from a fresh CMC snapshot. Stored privately in Firestore; financial inputs and calculations are not independently verified by a backend.');
  return { id: crypto.randomUUID(), createdAt: now, workspace: parsed.data, analysis, market, sample: parsed.data.provenance === 'sample' };
}
export function createTransport(store: PrivateStore, marketRequest: () => Promise<Response>, isSignedIn: () => boolean): typeof fetch {
  return async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, 'https://runway.local');
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    try {
      if (url.pathname === '/api/market' && method === 'GET') return await marketRequest();
      if (!isSignedIn()) throw new TransportError('Sign in to access private storage.', 401);
      if (url.pathname === '/api/workspace' && method === 'GET') return json(await store.getWorkspace());
      if (url.pathname === '/api/workspace' && method === 'PUT') {
        const body = JSON.parse(String(init?.body ?? '{}')) as { workspace: unknown; revision: unknown };
        const parsed = workspaceSchema.safeParse(body.workspace);
        if (!parsed.success || !Number.isSafeInteger(body.revision) || Number(body.revision) < 0) throw new TransportError('Check treasury inputs and workspace revision.', 400);
        return json(await store.saveWorkspace(parsed.data, Number(body.revision)));
      }
      if (url.pathname === '/api/reports' && method === 'GET') {
        const id = url.searchParams.get('id');
        if (!id) return json({ reports: await store.listReports() });
        const record = await store.getReport(id);
        if (!record) throw new TransportError('Report not found.', 404);
        return json(record);
      }
      if (url.pathname === '/api/reports' && method === 'POST') {
        const body = JSON.parse(String(init?.body ?? '{}')) as { workspace: unknown };
        const response = await marketRequest();
        const market = await response.json() as MarketSnapshot & { error?: string };
        if (!response.ok) throw new TransportError(market.error ?? 'Market data unavailable.');
        const record = makeLocalReport(body.workspace, market);
        await store.createReport(record);
        return json(record, 201);
      }
      return json({ error: 'Unsupported operation.' }, 405);
    } catch (error) {
      if (error instanceof TransportError) return json({ error: error.message }, error.status);
      if (error instanceof SyntaxError) return json({ error: 'Invalid request JSON.' }, 400);
      return json({ error: 'Storage or market service unavailable. Your draft is preserved.' }, 503);
    }
  };
}
