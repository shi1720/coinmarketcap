import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:5173";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("API mutation tests only run against loopback development.");
let checks = 0;
const check = (actual, expected) => {
  assert.equal(actual, expected);
  checks++;
};
const anon = await fetch(base + "/api/workspace");
check(anon.status, 401);
const forged = await fetch(base + "/api/workspace", {
  headers: {
    "oai-authenticated-user-id": "forged",
    "oai-authenticated-user-email": "forged@example.test",
  },
});
check(forged.status, 401);
const sign = await fetch(base + "/signin-with-chatgpt?return_to=/workspace", {
  redirect: "manual",
});
const cookie = sign.headers.get("set-cookie")?.split(";")[0];
assert.ok(cookie, "Local mock sign-in cookie missing");
const headers = {
  Cookie: cookie,
  Origin: base,
  "Content-Type": "application/json",
};
const old = await fetch(base + "/api/workspace", { headers }).then((r) =>
  r.json(),
);
const w = {
  provenance: "sample",
  name: "API verification sample",
  holdings: [
    { cmcId: 3408, symbol: "USDC", amount: 10000, availability: "available" },
  ],
  obligations: [
    {
      id: "pay",
      label: "Payroll",
      amount: 500,
      dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      recurring: true,
    },
  ],
  config: {
    fiatCash: 2000,
    monthlyBurn: 1000,
    targetReserveMonths: 1,
    minRunwayMonths: 3,
    feeBps: 100,
  },
  stress: { volatileShockPct: 40, stableShockPct: 10, stableSymbol: "USDC" },
};
const put = (workspace, revision, origin = base) =>
  fetch(base + "/api/workspace", {
    method: "PUT",
    headers: { ...headers, Origin: origin },
    body: JSON.stringify({ workspace, revision }),
  });
check((await put(w, old.revision, "https://attacker.example")).status, 403);
check(
  (
    await put(
      { ...w, obligations: [w.obligations[0], w.obligations[0]] },
      old.revision,
    )
  ).status,
  400,
);
const saved = await put(w, old.revision);
check(saved.status, 200);
const savedData = await saved.json();
check((await put(w, old.revision)).status, 409);
const read = await fetch(base + "/api/workspace", { headers }).then((r) =>
  r.json(),
);
check(read.workspace.name, w.name);
check(read.workspace.provenance, "sample");
check(
  (
    await fetch(base + "/api/reports", {
      method: "POST",
      headers: { Origin: base, "Content-Type": "application/json" },
      body: JSON.stringify({ workspace: w }),
    })
  ).status,
  401,
);
const create = await fetch(base + "/api/reports", {
  method: "POST",
  headers,
  body: JSON.stringify({ workspace: w }),
});
check(create.status, 201);
const record = await create.json();
check(record.sample, true);
assert.ok(record.market.quotes[3408].price > 0);
checks++;
const change = await put(
  { ...w, name: "Edited after snapshot" },
  savedData.revision,
);
check(change.status, 200);
const snapshot = await fetch(base + "/api/reports?id=" + record.id, {
  headers,
}).then((r) => r.json());
check(snapshot.workspace.name, w.name);
check((await fetch(base + "/api/reports?id=" + record.id)).status, 401);
check(
  (await fetch(base + "/api/reports?id=unknown-id", { headers })).status,
  404,
);
const history = await fetch(base + "/api/reports", { headers }).then((r) =>
  r.json(),
);
assert.ok(history.reports.some((r) => r.id === record.id));
checks++;
if (old.workspace) {
  const latest = await fetch(base + "/api/workspace", { headers }).then((r) =>
    r.json(),
  );
  check((await put(old.workspace, latest.revision)).status, 200);
}
console.log(
  `${checks} HTTP checks passed: auth, forged headers, origin, schema, persistence, revision conflicts, immutable reports and live CMC quotes.`,
);
