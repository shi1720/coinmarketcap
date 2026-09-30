import test from 'node:test';
import assert from 'node:assert/strict';
import { createTransport, makeLocalReport, TransportError, type PrivateStore } from '../firebase/transport-core.ts';
import { sampleWorkspace, type Workspace } from '../lib/workspace.ts';
import type { MarketSnapshot } from '../lib/market-types.ts';
import type { DecisionRecord } from '../lib/report.ts';

function market(now = new Date().toISOString()): MarketSnapshot {
  const quotes = Object.fromEntries([[1,'BTC',83000],[1027,'ETH',2670],[5426,'SOL',118],[3408,'USDC',1],[825,'USDT',1]].map(([id,symbol,price]) => [id, { id, symbol, name: symbol, price, percentChange24h: 0, volume24h: 1000, lastUpdated: now }]));
  return { quotes, fetchedAt: now, source: 'keyless', cache: 'fresh', missingIds: [], endpoint: 'https://pro-api.coinmarketcap.com/public-api/v3/cryptocurrency/quotes/latest', response: { status: { error_code: 0 } } } as MarketSnapshot;
}
function memoryStore(): PrivateStore {
  let workspace: Workspace | null = null, revision = 0;
  const reports = new Map<string, DecisionRecord>();
  return {
    async getWorkspace() { return { workspace, revision }; },
    async saveWorkspace(next, expected) { if (expected !== revision) throw new TransportError('Revision conflict; draft preserved.',409); workspace = structuredClone(next); return { revision: ++revision, updatedAt: new Date().toISOString() }; },
    async listReports() { return [...reports.values()].map(r => ({ id: r.id, created_at: r.createdAt })); },
    async getReport(id) { return reports.get(id) ?? null; },
    async createReport(record) { if (reports.has(record.id)) throw new TransportError('Immutable record exists.',409); reports.set(record.id,structuredClone(record)); },
  };
}
test('market remains public while anonymous requests cannot read or write private data',async()=>{
  const request=createTransport(memoryStore(),async()=>Response.json(market()),()=>false);
  assert.equal((await request('/api/market')).status,200);
  for(const path of ['/api/workspace','/api/reports','/api/reports?id=any']) assert.equal((await request(path)).status,401);
  assert.equal((await request('/api/workspace',{method:'PUT',body:JSON.stringify({workspace:sampleWorkspace(),revision:0})})).status,401);
});
test('workspace optimistic revision rejects overwrites and validates inputs',async()=>{
  const request=createTransport(memoryStore(),async()=>Response.json(market()),()=>true);
  const body=JSON.stringify({workspace:sampleWorkspace(),revision:0});
  assert.equal((await request('/api/workspace',{method:'PUT',body})).status,200);
  assert.equal((await request('/api/workspace',{method:'PUT',body})).status,409);
  assert.equal(((await(await request('/api/workspace')).json()) as { revision: number }).revision,1);
  assert.equal((await request('/api/workspace',{method:'PUT',body:'{'})).status,400);
  assert.equal((await request('/api/workspace',{method:'PUT',body:JSON.stringify({workspace:{},revision:0})})).status,400);
});
test('report creation obtains a fresh market snapshot and labels its calculation origin',async()=>{
  let calls=0;
  const request=createTransport(memoryStore(),async()=>{calls++;return Response.json(market());},()=>true);
  const response=await request('/api/reports',{method:'POST',body:JSON.stringify({workspace:sampleWorkspace()})});
  assert.equal(response.status,201);assert.equal(calls,1);
  const record=await response.json() as DecisionRecord;
  assert.ok(record.analysis.assumptions.some(a=>a.includes('Calculated locally')&&a.includes('not independently verified')));
  const read=await request('/api/reports?id='+record.id);assert.deepEqual(await read.json(),record);
  assert.equal((await request('/api/reports?id='+record.id,{method:'DELETE'})).status,405);
  assert.equal((await request('/api/reports?id='+record.id,{method:'PUT',body:'{}'})).status,405);
  assert.equal(((await(await request('/api/reports')).json()) as { reports: unknown[] }).reports.length,1);
});
test('stale, missing, future-dated and zero-commitment reports fail before storage',async()=>{
  const now='2026-09-30T12:00:00Z',w=sampleWorkspace(new Date(now));
  const stale=market(now);stale.cache='stale';assert.throws(()=>makeLocalReport(w,stale,now),TransportError);
  const missing=market(now);delete missing.quotes[1027];assert.throws(()=>makeLocalReport(w,missing,now),TransportError);
  const future=market(now);future.quotes[1027].lastUpdated='2026-09-30T13:00:00Z';assert.throws(()=>makeLocalReport(w,future,now),TransportError);
  const empty={...w,obligations:[],config:{...w.config,monthlyBurn:0}};assert.throws(()=>makeLocalReport(empty,market(now),now),TransportError);
});
test('private storage failures surface a recoverable response rather than a success',async()=>{
  const store=memoryStore();store.saveWorkspace=async()=>{throw Error('offline');};
  const request=createTransport(store,async()=>Response.json(market()),()=>true);
  const response=await request('/api/workspace',{method:'PUT',body:JSON.stringify({workspace:sampleWorkspace(),revision:0})});
  assert.equal(response.status,503);assert.match(((await response.json()) as { error: string }).error,/draft is preserved/);
});
