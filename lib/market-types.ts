export const ASSETS = [
  { id: 1, symbol: "BTC", name: "Bitcoin", color: "#ea9220" },
  { id: 1027, symbol: "ETH", name: "Ethereum", color: "#596bd7" },
  { id: 5426, symbol: "SOL", name: "Solana", color: "#1a9587" },
  { id: 3408, symbol: "USDC", name: "USD Coin", color: "#2875d2" },
  { id: 825, symbol: "USDT", name: "Tether", color: "#218d72" },
] as const;
export type MarketQuote = {
  id: number;
  symbol: string;
  name: string;
  price: number;
  percentChange24h: number;
  volume24h: number;
  lastUpdated: string;
};
export type MarketSnapshot = {
  quotes: Record<number, MarketQuote>;
  fetchedAt: string;
  source: "keyless" | "authenticated";
  endpoint: string;
  response: unknown;
  cache: "fresh" | "cached" | "stale";
  error?: string;
  missingIds: number[];
};
