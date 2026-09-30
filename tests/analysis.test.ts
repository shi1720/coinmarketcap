import test from "node:test";
import assert from "node:assert/strict";
import { analyzeTreasury } from "../lib/analysis.ts";
import type { AnalysisInput, Quote } from "../lib/analysis";

const asOf = "2026-09-30T12:00:00Z";
function quote(id: number, symbol: string, price: number): Quote {
  return {
    id,
    symbol,
    name: symbol,
    price,
    percentChange24h: 0,
    volume24h: 1e12,
    lastUpdated: asOf,
  };
}
function input(): AnalysisInput {
  return {
    asOf,
    holdings: [
      { cmcId: 1, symbol: "BTC", amount: 2, availability: "available" },
      {
        cmcId: 3408,
        symbol: "USDC",
        amount: 50_000,
        availability: "available",
      },
    ],
    obligations: [],
    quotes: { 1: quote(1, "BTC", 50_000), 3408: quote(3408, "USDC", 1) },
    config: {
      fiatCash: 10_000,
      monthlyBurn: 10_000,
      targetReserveMonths: 3,
      minRunwayMonths: 6,
      feeBps: 100,
    },
    stress: { volatileShockPct: 40, stableShockPct: 10, stableSymbol: "USDC" },
  };
}

test("values current/stressed treasury, fee-adjusted reserves and units deterministically", () => {
  const result = analyzeTreasury(input());
  assert.equal(result.current.markedTotal, 160_000);
  assert.equal(result.current.liquidatableTotal, 158_500);
  assert.equal(result.stressed.markedTotal, 115_000);
  assert.equal(result.stressed.liquidatableTotal, 113_950);
  assert.equal(result.reservePlan.targetFiat, 30_000);
  assert.equal(result.reservePlan.fiatGap, 20_000);
  assert.equal(result.reservePlan.plannedProceeds, 20_000);
  assert.equal(result.reservePlan.sales[0].units, 20_000 / (30_000 * 0.99));
  assert.equal(result.reservePlan.feasible, true);
  assert.equal(result.readiness, "at-risk");
  assert.deepEqual(result, analyzeTreasury(input()));
});

test("locked and frozen assets never count toward payment coverage or reserve plan", () => {
  const i = input();
  i.holdings[0].availability = "locked";
  i.stress.accessFreezeSymbol = "USDC";
  const r = analyzeTreasury(i);
  assert.equal(r.current.lockedTotal, 100_000);
  assert.equal(r.current.availableTotal, 60_000);
  assert.equal(r.stressed.availableTotal, 10_000);
  assert.equal(r.stressed.frozenTotal, 45_000);
  assert.equal(r.reservePlan.sales.length, 0);
  assert.equal(r.reservePlan.remainingGap, 20_000);
  assert.equal(r.reservePlan.feasible, false);
});

test("recurring expenses do not double count burn; scheduled one-offs and overdue amounts do", () => {
  const i = input();
  i.obligations = [
    {
      id: "pay",
      label: "Payroll",
      amount: 10_000,
      dueDate: "2026-10-05",
      recurring: true,
    },
    {
      id: "now",
      label: "Unpaid invoice",
      amount: 1_000,
      dueDate: "2026-09-01",
      recurring: false,
    },
    {
      id: "once",
      label: "Audit",
      amount: 2_000,
      dueDate: "2026-10-05",
      recurring: false,
    },
    {
      id: "future",
      label: "Next year",
      amount: 99_000,
      dueDate: "2027-09-30",
      recurring: false,
    },
  ];
  const r = analyzeTreasury(i);
  assert.equal(r.dailyCoverage[0].oneOffObligations, 1_000);
  assert.equal(r.dailyCoverage[4].oneOffObligations, 1_000);
  assert.equal(r.dailyCoverage[5].oneOffObligations, 3_000);
  assert.equal(r.dailyCoverage[4].burn, 0);
  assert.equal(r.dailyCoverage[5].burn, 10_000);
  assert.equal(r.dailyCoverage[30].totalRequired, 13_000);
  assert.equal(r.reservePlan.targetFiat, 33_000);
  assert.ok(r.current.runwayMonths < 12); // Annual one-off creates an earlier insolvency cliff.
});

test("missing or mismatched quotes are excluded and block readiness", () => {
  const i = input();
  i.quotes[1].symbol = "ETH";
  i.holdings.push({
    cmcId: 999,
    symbol: "UNKNOWN",
    amount: 1,
    availability: "available",
  });
  const r = analyzeTreasury(i);
  assert.deepEqual(r.missingQuoteIds, [1, 999]);
  assert.equal(r.readiness, "blocked");
  assert.equal(r.current.markedTotal, 60_000);
  assert.equal(r.reservePlan.feasible, false);
});

test("stable shock is selective and freezes are separate from price shock", () => {
  const i = input();
  i.holdings.push({
    cmcId: 825,
    symbol: "USDT",
    amount: 50_000,
    availability: "available",
  });
  i.quotes[825] = quote(825, "USDT", 1);
  const selected = analyzeTreasury(i);
  assert.equal(selected.stressed.markedTotal, 165_000);
  i.stress.stableSymbol = "ALL";
  assert.equal(analyzeTreasury(i).stressed.markedTotal, 160_000);
});

test("stale and depegged data warn without using reported volume as capacity", () => {
  const i = input();
  i.quotes[3408].lastUpdated = "2026-09-30T11:00:00Z";
  i.quotes[3408].price = 0.98;
  const r = analyzeTreasury(i);
  assert.ok(r.warnings.some((w) => w.code === "STALE_QUOTE"));
  assert.ok(r.warnings.some((w) => w.code === "OBSERVED_DEPEG"));
  i.quotes[1].volume24h = 0;
  assert.deepEqual(analyzeTreasury(i), r);
});

test("zero burn and no obligations produce disclosed capped runway; adequate fiat is ready", () => {
  const i = input();
  i.config.monthlyBurn = 0;
  const r = analyzeTreasury(i);
  assert.equal(r.current.runwayMonths, 120);
  assert.equal(r.current.runwayCapped, true);
  assert.equal(r.readiness, "ready");
  assert.equal(r.reservePlan.sales.length, 0);
});

test("cent accounting conservatively caps tiny liquidation estimates", () => {
  const i = input();
  i.holdings = [
    { cmcId: 1, symbol: "BTC", amount: 0.00000011, availability: "available" },
  ];
  i.config = {
    fiatCash: 0.1,
    monthlyBurn: 0.3,
    targetReserveMonths: 1,
    minRunwayMonths: 1,
    feeBps: 0,
  };
  i.stress.volatileShockPct = 0;
  const r = analyzeTreasury(i);
  assert.equal(r.current.markedTotal, 0.11);
  assert.equal(r.current.liquidatableTotal, 0.1); // $0.0055 marks to a cent, but cannot fund a full cent.
  assert.equal(r.reservePlan.plannedProceeds, 0);
  assert.equal(r.reservePlan.remainingGap, 0.2);
  assert.equal(r.dailyCoverage[1].currentBalance, 0.09);
});

test("rejects invalid financial inputs, duplicate obligations, dates and unsafe cash precision", () => {
  const cases: Array<(i: AnalysisInput) => void> = [
    (i) => {
      i.config.fiatCash = -1;
    },
    (i) => {
      i.config.monthlyBurn = NaN;
    },
    (i) => {
      i.config.feeBps = 10_000;
    },
    (i) => {
      i.stress.volatileShockPct = 101;
    },
    (i) => {
      i.holdings[0].amount = Infinity;
    },
    (i) => {
      i.config.fiatCash = Number.MAX_SAFE_INTEGER;
    },
    (i) => {
      i.asOf = "2026-02-30";
    },
    (i) => {
      i.asOf = "2026-09-30T12:00:00";
    },
    (i) => {
      const o = {
        id: "same",
        label: "bill",
        amount: 1,
        dueDate: "2026-10-01",
        recurring: false,
      };
      i.obligations = [o, o];
    },
  ];
  for (const mutate of cases) {
    const i = input();
    mutate(i);
    assert.throws(() => analyzeTreasury(i));
  }
});

test("a 100% price shock cannot propose selling zero-value assets", () => {
  const i = input();
  i.stress.volatileShockPct = 100;
  const r = analyzeTreasury(i);
  assert.equal(r.reservePlan.sales.length, 0);
  assert.equal(r.reservePlan.feasible, false);
  assert.equal(r.stressed.markedTotal, 55_000);
});

test("payroll dates create cash cliffs and recur monthly without daily double counting", () => {
  const i = input();
  i.asOf = "2026-01-30T12:00:00Z";
  Object.values(i.quotes).forEach((q) => {
    q.lastUpdated = i.asOf!;
  });
  i.obligations = [
    {
      id: "pay",
      label: "Payroll",
      amount: 10_000,
      dueDate: "2026-01-31",
      recurring: true,
    },
  ];
  const r = analyzeTreasury(i);
  assert.equal(r.dailyCoverage[0].burn, 0);
  assert.equal(r.dailyCoverage[1].burn, 10_000);
  assert.equal(r.dailyCoverage[28].burn, 10_000);
  assert.equal(r.dailyCoverage[29].burn, 20_000); // February clamps to the 28th.
  assert.equal(r.weeklyCoverage[9].burn, 30_000); // March returns to the 31st.
});

test("recurring obligations above burn block readiness and remain counted", () => {
  const i = input();
  i.obligations = [
    {
      id: "pay",
      label: "Payroll",
      amount: 20_000,
      dueDate: "2026-10-01",
      recurring: true,
    },
  ];
  const r = analyzeTreasury(i);
  assert.equal(r.readiness, "blocked");
  assert.equal(r.reservePlan.feasible, false);
  assert.equal(r.dailyCoverage[1].burn, 20_000);
  assert.ok(r.warnings.some((w) => w.code === "BURN_MISMATCH"));
});

test("leap-year payroll clamps to Feb 29 and first shortfall identifies the actual cash cliff", () => {
  const i = input();
  i.asOf = "2028-01-30T12:00:00Z";
  Object.values(i.quotes).forEach((q) => {
    q.lastUpdated = i.asOf!;
  });
  i.holdings = [];
  i.config.fiatCash = 15_000;
  i.config.targetReserveMonths = 1;
  i.obligations = [
    {
      id: "pay",
      label: "Payroll",
      amount: 10_000,
      dueDate: "2028-01-31",
      recurring: true,
    },
  ];
  const r = analyzeTreasury(i);
  assert.equal(r.dailyCoverage[29].burn, 10_000);
  assert.equal(r.dailyCoverage[30].burn, 20_000);
  assert.equal(r.current.firstShortfallDate, "2028-02-29");
  assert.equal(r.stressed.firstShortfallDate, "2028-02-29");
  assert.equal(r.reservePlan.targetFiat, 20_000); // Covers both dates inside the one-month horizon.
});

test("overdue one-offs can create a same-day shortfall, whereas capped runway has no date", () => {
  const i = input();
  i.obligations = [
    {
      id: "bill",
      label: "Overdue",
      amount: 200_000,
      dueDate: "2026-09-01",
      recurring: false,
    },
  ];
  assert.equal(analyzeTreasury(i).current.firstShortfallDate, "2026-09-30");
  i.obligations = [];
  i.config.monthlyBurn = 0;
  assert.equal(analyzeTreasury(i).current.firstShortfallDate, null);
});

test("daily chart spans exactly 90 days and captures every recurring payment cliff", () => {
  const i = input();
  i.obligations = [
    {
      id: "pay",
      label: "Payroll",
      amount: 10_000,
      dueDate: "2026-10-07",
      recurring: true,
    },
  ];
  const r = analyzeTreasury(i);
  assert.equal(r.dailyCoverage.length, 91);
  assert.equal(r.dailyCoverage[90].date, "2026-12-29");
  assert.equal(r.dailyCoverage[37].burn, 10_000);
  assert.equal(r.dailyCoverage[38].burn, 20_000);
  assert.equal(r.dailyCoverage[67].burn, 20_000);
  assert.equal(r.dailyCoverage[68].burn, 30_000);
  assert.deepEqual(r.weeklyCoverage.at(-1), r.dailyCoverage[90]);
});

test("zero continuous burn still accounts for future one-off insolvency", () => {
  const i = input();
  i.holdings = [];
  i.config.monthlyBurn = 0;
  i.obligations = [
    {
      id: "bill",
      label: "Renewal",
      amount: 10_001,
      dueDate: "2027-03-01",
      recurring: false,
    },
  ];
  const r = analyzeTreasury(i);
  assert.equal(r.current.firstShortfallDate, "2027-03-01");
  assert.equal(r.current.runwayCapped, false);
  assert.equal(r.reservePlan.targetFiat, 0);
});

test("future-dated held quote cannot mark an otherwise sufficient treasury ready", () => {
  const i = input();
  i.config.fiatCash = 100_000;
  i.quotes[1].lastUpdated = "2026-09-30T13:00:00Z";
  const r = analyzeTreasury(i);
  assert.equal(r.readiness, "at-risk");
  assert.ok(
    r.warnings.some(
      (w) => w.code === "STALE_QUOTE" && w.message.includes("future-dated"),
    ),
  );
});

test("fractional sale previews never exceed units or assume more than cent-safe proceeds", () => {
  for (let n = 1; n <= 100; n++) {
    const i = input();
    i.holdings = [
      { cmcId: 1, symbol: "BTC", amount: n / 137, availability: "available" },
    ];
    i.quotes[1].price = n * 17.1937;
    i.config = {
      fiatCash: 0.37,
      monthlyBurn: n * 7.1981,
      targetReserveMonths: 3,
      minRunwayMonths: 6,
      feeBps: n * 17,
    };
    i.stress.volatileShockPct = n % 79;
    const r = analyzeTreasury(i);
    assert.ok(r.reservePlan.remainingGap >= 0);
    for (const sale of r.reservePlan.sales) {
      assert.ok(sale.units <= i.holdings[0].amount);
      assert.ok(sale.units >= 0 && Number.isFinite(sale.units));
      assert.ok(
        sale.netProceeds <=
          sale.units * sale.stressedPrice * (1 - i.config.feeBps / 10000) +
            1e-9,
      );
      const after = {
        ...i,
        holdings: [
          { ...i.holdings[0], amount: i.holdings[0].amount - sale.units },
        ],
        config: { ...i.config, fiatCash: i.config.fiatCash + sale.netProceeds },
      };
      const preview = analyzeTreasury(after);
      assert.ok(
        preview.stressed.liquidatableTotal <=
          r.stressed.liquidatableTotal + 0.01,
      );
      assert.ok(
        preview.stressed.liquidatableTotal >=
          r.stressed.liquidatableTotal - 0.01,
      );
    }
  }
});
