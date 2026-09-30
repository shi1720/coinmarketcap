import { ASSETS, type MarketQuote } from "./market-types.ts";

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function timestamp(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) return false;
  const calendar = value.slice(0, 10);
  return new Date(calendar + "T00:00:00Z").toISOString().slice(0, 10) === calendar;
}

// Reject invalid envelopes; malformed members cannot discard other valid assets.
export function normalizeQuotes(payload: unknown): Record<number, MarketQuote> {
  if (
    !object(payload) ||
    !object(payload.status) ||
    ![0, "0"].includes(payload.status.error_code as number | string) ||
    !Array.isArray(payload.data)
  ) throw new Error("CMC returned an invalid response.");
  const out: Record<number, MarketQuote> = {};
  for (const item of payload.data) {
    if (!object(item)) continue;
    const ref = ASSETS.find((asset) => asset.id === item.id);
    if (!ref || item.symbol !== ref.symbol || !Array.isArray(item.quote)) continue;
    for (const quote of item.quote) {
      if (
        !object(quote) || quote.symbol !== "USD" ||
        typeof quote.price !== "number" || !Number.isFinite(quote.price) ||
        quote.price <= 0 || !timestamp(quote.last_updated)
      ) continue;
      out[ref.id] = {
        id: ref.id,
        symbol: ref.symbol,
        name: typeof item.name === "string" ? item.name : ref.name,
        price: quote.price,
        percentChange24h: typeof quote.percent_change_24h === "number" && Number.isFinite(quote.percent_change_24h) ? quote.percent_change_24h : 0,
        volume24h: typeof quote.volume_24h === "number" && Number.isFinite(quote.volume_24h) ? quote.volume_24h : 0,
        lastUpdated: quote.last_updated,
      };
      break;
    }
  }
  return out;
}
