import test from "node:test";
import assert from "node:assert/strict";
import { readinessTools } from "../lib/webmcp.ts";
import { sampleWorkspace } from "../lib/workspace.ts";
const workspace = sampleWorkspace(new Date("2026-09-30T00:00:00Z"));
const quotes = Object.fromEntries(
  workspace.holdings.map((h) => [
    h.cmcId,
    {
      id: h.cmcId,
      symbol: h.symbol,
      name: h.symbol,
      price:
        h.symbol === "ETH"
          ? 2000
          : h.symbol === "SOL"
            ? 100
            : h.symbol === "BTC"
              ? 80000
              : 1,
      percentChange24h: 0,
      volume24h: 1,
      lastUpdated: "2026-09-30T00:00:00Z",
    },
  ]),
);
const state = {
  workspace,
  now: "2026-09-30T00:00:00Z",
  market: {
    quotes,
    fetchedAt: "2026-09-30T00:00:00Z",
    source: "keyless" as const,
    cache: "fresh" as const,
    endpoint: "https://pro-api.coinmarketcap.com",
    response: {},
    missingIds: [],
  },
};
test("WebMCP tools expose read-only summary and same deterministic stress calculation", () => {
  const tools = readinessTools(() => state);
  assert.equal(tools[0].annotations.readOnlyHint, true);
  const result = tools[0].execute({});
  assert.equal(result.planningOnly, true);
  const before = JSON.stringify(state);
  const stress = tools[1].execute({
    volatileShockPct: 100,
    stableShockPct: 10,
    stableSymbol: "USDC",
  });
  assert.ok(stress.stressedRunwayMonths < result.stressedRunwayMonths);
  assert.equal(JSON.stringify(state), before);
  assert.throws(() =>
    tools[1].execute({
      volatileShockPct: -1,
      stableShockPct: 10,
      stableSymbol: "USDC",
    }),
  );
});
test("WebMCP refuses unavailable market evidence", () => {
  const tools = readinessTools(() => ({ ...state, market: null }));
  assert.throws(() => tools[0].execute({}), /unavailable/);
});
