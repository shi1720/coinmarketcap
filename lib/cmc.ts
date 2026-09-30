import { env } from "cloudflare:workers";
import { database } from "./storage";
import { ASSETS, type MarketSnapshot } from "./market-types";
import { normalizeQuotes } from "./cmc-normalize";
import { fetchCMC } from "./cmc-http";
import { createMarketService } from "./market-service";
async function requestMarket(
  source: MarketSnapshot["source"],
): Promise<MarketSnapshot> {
  const keyed = source === "authenticated";
  const root = keyed
    ? "https://pro-api.coinmarketcap.com"
    : "https://pro-api.coinmarketcap.com/public-api";
  const endpoint =
    root +
    "/v3/cryptocurrency/quotes/latest?id=" +
    ASSETS.map((x) => x.id).join(",") +
    "&convert=USD";
  const response = await fetchCMC(endpoint, {
    Accept: "application/json",
    ...(keyed ? { "X-CMC_PRO_API_KEY": env.CMC_API_KEY! } : {}),
  });
  const payload: unknown = await response.json();
  const quotes = normalizeQuotes(payload);
  if (!Object.keys(quotes).length)
    throw new Error("No valid CMC prices returned.");
  const snapshot: MarketSnapshot = {
    quotes,
    fetchedAt: new Date().toISOString(),
    source: keyed ? "authenticated" : "keyless",
    endpoint,
    response: payload,
    cache: "fresh",
    missingIds: ASSETS.filter((x) => !quotes[x.id]).map((x) => x.id),
  };
  return snapshot;
}
const service = createMarketService({
  request: requestMarket,
  read: async () => {
    const row = await database()
      .prepare("SELECT data FROM market_cache WHERE key=?")
      .bind("quotes")
      .first<{ data: string }>();
    return row ? (JSON.parse(row.data) as MarketSnapshot) : null;
  },
  write: async (snapshot) => {
    await database()
      .prepare(
        "INSERT INTO market_cache (key,data,fetched_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data,fetched_at=excluded.fetched_at",
      )
      .bind("quotes", JSON.stringify(snapshot), snapshot.fetchedAt)
      .run();
  },
});
export function getMarket(): Promise<MarketSnapshot> {
  return service(env.CMC_API_KEY ? "authenticated" : "keyless");
}
