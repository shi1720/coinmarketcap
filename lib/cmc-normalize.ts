import { ASSETS, type MarketQuote } from "./market-types.ts";
// Validate the current V3 format rather than accepting a success-shaped error.
export function normalizeQuotes(payload: unknown): Record<number, MarketQuote> {
  const p = payload as {
    status?: { error_code?: string | number };
    data?: unknown[];
  };
  if (!p || Number(p.status?.error_code ?? -1) !== 0 || !Array.isArray(p.data))
    throw new Error("CMC returned an invalid response.");
  const out: Record<number, MarketQuote> = {};
  for (const item of p.data) {
    const a = item as {
      id: number;
      symbol: string;
      name: string;
      quote?: Array<{
        symbol: string;
        price: number;
        percent_change_24h: number;
        volume_24h: number;
        last_updated: string;
      }>;
    };
    const ref = ASSETS.find((x) => x.id === a.id);
    const q = a.quote?.find((x) => x.symbol === "USD");
    if (
      !ref ||
      a.symbol !== ref.symbol ||
      !q ||
      !Number.isFinite(q.price) ||
      q.price <= 0 ||
      !Number.isFinite(Date.parse(q.last_updated))
    )
      continue;
    out[a.id] = {
      id: a.id,
      symbol: a.symbol,
      name: a.name,
      price: q.price,
      percentChange24h: Number.isFinite(q.percent_change_24h)
        ? q.percent_change_24h
        : 0,
      volume24h: Number.isFinite(q.volume_24h) ? q.volume_24h : 0,
      lastUpdated: q.last_updated,
    };
  }
  return out;
}
