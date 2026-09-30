import test from "node:test";
import assert from "node:assert/strict";
import { normalizeQuotes } from "../lib/cmc-normalize.ts";
import { fetchCMC } from "../lib/cmc-http.ts";
test("V3 quotes must match canonical IDs and symbols, require USD positive price", () => {
  const base = {
    id: 1027,
    symbol: "ETH",
    name: "Ethereum",
    quote: [
      {
        symbol: "USD",
        price: 2000,
        volume_24h: 42,
        percent_change_24h: -3,
        last_updated: "2026-09-30T00:00:00Z",
      },
    ],
  };
  assert.equal(
    normalizeQuotes({ status: { error_code: "0" }, data: [base] })[1027].price,
    2000,
  );
  assert.deepEqual(
    normalizeQuotes({
      status: { error_code: 0 },
      data: [{ ...base, symbol: "FAKE" }],
    }),
    {},
  );
  assert.throws(() =>
    normalizeQuotes({ status: { error_code: 1001 }, data: [] }),
  );
  assert.throws(() => normalizeQuotes({ status: { error_code: 0 }, data: {} }));
});
test("CMC authorization errors are never retried", async () => {
  let calls = 0;
  await assert.rejects(
    fetchCMC(
      "https://example.test",
      {},
      async () => {
        calls++;
        return new Response("", { status: 401 });
      },
      async () => {},
    ),
    /401/,
  );
  assert.equal(calls, 1);
});
test("CMC 429 then 503 recovers with bounded retries", async () => {
  let calls = 0;
  const delays: number[] = [];
  const r = await fetchCMC(
    "https://example.test",
    {},
    async () => new Response("", { status: [429, 503, 200][calls++] }),
    async (d) => {
      delays.push(d);
    },
  );
  assert.equal(r.status, 200);
  assert.equal(calls, 3);
  assert.deepEqual(delays, [250, 500]);
});
test("CMC network failure has exactly three attempts", async () => {
  let calls = 0;
  await assert.rejects(
    fetchCMC(
      "https://example.test",
      {},
      async () => {
        calls++;
        throw Error("timeout");
      },
      async () => {},
    ),
  );
  assert.equal(calls, 3);
});
import { createMarketService } from "../lib/market-service.ts";
import type { MarketSnapshot } from "../lib/market-types.ts";
const snapshot = (time: number): MarketSnapshot => ({
  quotes: {},
  fetchedAt: new Date(time).toISOString(),
  source: "keyless",
  endpoint:
    "https://pro-api.coinmarketcap.com/public-api/v3/cryptocurrency/quotes/latest",
  response: { status: { error_code: 0 }, data: [] },
  cache: "fresh",
  missingIds: [],
});
test("persistent cache failures preserve successful live quotes", async () => {
  let calls = 0;
  const service = createMarketService({
    now: () => 1000000,
    read: async () => {
      throw Error("db down");
    },
    write: async () => {
      throw Error("db down");
    },
    request: async () => {
      calls++;
      return snapshot(1000000);
    },
  });
  assert.equal((await service("keyless")).cache, "fresh");
  assert.equal((await service("keyless")).cache, "cached");
  assert.equal(calls, 1);
});
test("concurrent refreshes make one upstream request", async () => {
  let calls = 0;
  const service = createMarketService({
    now: () => 1000000,
    read: async () => null,
    write: async () => {},
    request: async () => {
      calls++;
      await new Promise((r) => setTimeout(r, 10));
      return snapshot(1000000);
    },
  });
  await Promise.all([
    service("keyless"),
    service("keyless"),
    service("keyless"),
  ]);
  assert.equal(calls, 1);
});
test("failed upstream serves labelled stale snapshot and cools down", async () => {
  let clock = 1000000,
    calls = 0;
  const old = snapshot(clock - 400000);
  const service = createMarketService({
    now: () => clock,
    read: async () => old,
    write: async () => {},
    request: async () => {
      calls++;
      throw Error("upstream down");
    },
  });
  assert.equal((await service("keyless")).cache, "stale");
  assert.equal((await service("keyless")).cache, "stale");
  assert.equal(calls, 1);
  clock += 31000;
  await service("keyless");
  assert.equal(calls, 2);
});
test("no snapshot with failed upstream produces error, never synthetic prices", async () => {
  const service = createMarketService({
    now: () => 1000000,
    read: async () => null,
    write: async () => {},
    request: async () => {
      throw Error("down");
    },
  });
  await assert.rejects(service("keyless"));
});
