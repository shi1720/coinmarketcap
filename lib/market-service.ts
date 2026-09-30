import type { MarketSnapshot } from "./market-types.ts";
type Source = MarketSnapshot["source"];
type Dependencies = {
  request: (source: Source) => Promise<MarketSnapshot>;
  read: () => Promise<MarketSnapshot | null>;
  write: (snapshot: MarketSnapshot) => Promise<void>;
  now?: () => number;
  onFailure?: (diagnostic: string) => void;
};
/** Only fixed diagnostic codes may leave the server. Never return raw errors or request details. */
export function marketFailureDiagnostic(error: unknown): string {
  if (error instanceof SyntaxError) return "CMC_INVALID_JSON";
  if (!(error instanceof Error)) return "CMC_REFRESH_FAILED";
  const http = /^CMC request unavailable \(HTTP ([1-5]\d{2})\)\.$/.exec(
    error.message,
  );
  if (http) return `CMC_HTTP_${http[1]}`;
  if (error.message === "CMC network request unavailable.")
    return "CMC_NETWORK_UNAVAILABLE";
  if (error.message === "CMC returned an invalid response.")
    return "CMC_INVALID_RESPONSE";
  if (error.message === "No valid CMC prices returned.")
    return "CMC_NO_VALID_QUOTES";
  return "CMC_REFRESH_FAILED";
}
/** Shared cache, in-flight deduplication and a failure cooldown. Storage is best-effort. */
export function createMarketService({
  request,
  read,
  write,
  now = Date.now,
  onFailure,
}: Dependencies) {
  let memory: MarketSnapshot | null = null;
  let pending: Promise<MarketSnapshot> | null = null;
  let failureAt = 0;
  let failureSource: Source | null = null;
  let failureDiagnostic = "CMC_REFRESH_FAILED";
  return async function get(source: Source): Promise<MarketSnapshot> {
    let saved = memory;
    if (
      !saved ||
      saved.source !== source ||
      now() - Date.parse(saved.fetchedAt) >= 300000
    ) {
      try {
        const row = await read();
        if (
          row &&
          (!saved || Date.parse(row.fetchedAt) > Date.parse(saved.fetchedAt))
        )
          saved = row;
      } catch {
        /* Live quotes remain usable if persistent cache is down. */
      }
    }
    const age = saved ? now() - Date.parse(saved.fetchedAt) : Infinity;
    if (saved && saved.source === source && age >= 0 && age < 300000) {
      memory = saved;
      return { ...saved, cache: "cached" };
    }
    const stale = () => {
      if (saved)
        return {
          ...saved,
          cache: "stale" as const,
          error: `Refresh failed (${failureDiagnostic}). Prices below are from the last successful CMC call.`,
        };
      throw new Error(
        "Market data temporarily unavailable. Please retry shortly.",
      );
    };
    if (failureSource === source && now() - failureAt < 30000) return stale();
    if (!pending)
      pending = (async () => {
        const snapshot = await request(source);
        memory = snapshot;
        failureSource = null;
        try {
          await write(snapshot);
        } catch {
          /* Do not discard a successful upstream response. */
        }
        return snapshot;
      })().finally(() => {
        pending = null;
      });
    try {
      return await pending;
    } catch (error) {
      failureAt = now();
      failureSource = source;
      failureDiagnostic = marketFailureDiagnostic(error);
      try {
        onFailure?.(failureDiagnostic);
      } catch {
        /* Diagnostics cannot alter failure handling. */
      }
      return stale();
    }
  };
}
