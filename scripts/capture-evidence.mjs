import { mkdir, writeFile } from "node:fs/promises";
const keyed = Boolean(process.env.CMC_API_KEY);
const endpoint = `https://pro-api.coinmarketcap.com${keyed ? "" : "/public-api"}/v3/cryptocurrency/quotes/latest?id=1,1027,5426,3408,825&convert=USD`;
const response = await fetch(endpoint, {
  headers: {
    Accept: "application/json",
    ...(keyed ? { "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY } : {}),
  },
  signal: AbortSignal.timeout(15000),
});
if (!response.ok) throw new Error(`CMC HTTP ${response.status}`);
const payload = await response.json();
if (Number(payload.status?.error_code) !== 0 || !Array.isArray(payload.data))
  throw new Error("Invalid CMC response");
await mkdir("evidence", { recursive: true });
const mode = keyed ? "authenticated" : "keyless";
await writeFile(
  `evidence/cmc-${mode}-response.json`,
  JSON.stringify(payload, null, 2) + "\n",
);
await writeFile(
  "evidence/cmc-request.json",
  JSON.stringify(
    {
      method: "GET",
      endpoint,
      capturedAt: new Date().toISOString(),
      source: mode,
      status: response.status,
      returnedAssets: payload.data.map((a) => ({ id: a.id, symbol: a.symbol })),
      requestHeaders:
        "Accept: application/json; API key intentionally omitted from evidence",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Captured real ${mode} CMC response for ${payload.data.length} assets. No secrets written.`,
);
