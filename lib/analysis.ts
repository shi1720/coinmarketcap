/** Deterministic, USD-only planning. Cash sums are integer cents; this is not an execution engine. */
export interface Holding {
  cmcId: number;
  symbol: string;
  amount: number;
  availability: "available" | "locked";
}
/** Recurring rows schedule the portion of monthlyBurn they represent; never add them to monthlyBurn. */
export interface Obligation {
  id: string;
  label: string;
  amount: number;
  dueDate: string;
  recurring: boolean;
}
export interface TreasuryConfig {
  fiatCash: number;
  monthlyBurn: number;
  targetReserveMonths: number;
  minRunwayMonths: number;
  feeBps: number;
}
export interface Quote {
  id: number;
  symbol: string;
  name: string;
  price: number;
  percentChange24h: number;
  volume24h: number;
  lastUpdated: string;
}
export type QuoteMap = Record<number, Quote>;
export interface StressScenario {
  volatileShockPct: number;
  stableShockPct: number;
  stableSymbol: "USDC" | "USDT" | "ALL";
  accessFreezeSymbol?: string;
}
export interface AnalysisInput {
  holdings: Holding[];
  obligations: Obligation[];
  config: TreasuryConfig;
  quotes: QuoteMap;
  stress: StressScenario;
  asOf?: string;
}
export interface Valuation {
  markedTotal: number;
  availableTotal: number;
  liquidatableTotal: number;
  lockedTotal: number;
  frozenTotal: number;
  runwayMonths: number;
  runwayCapped: boolean;
  firstShortfallDate: string | null;
}
export interface CoveragePoint {
  date: string;
  days: number;
  burn: number;
  oneOffObligations: number;
  totalRequired: number;
  fiatBalance: number;
  currentBalance: number;
  stressedBalance: number;
  covered: boolean;
}
export interface AnalysisWarning {
  code: string;
  severity: "info" | "warning" | "critical";
  message: string;
}
export interface ReserveSale {
  cmcId: number;
  symbol: string;
  units: number;
  stressedPrice: number;
  netProceeds: number;
}
export interface TreasuryAnalysis {
  asOf: string;
  readiness: "ready" | "at-risk" | "blocked";
  current: Valuation;
  stressed: Valuation;
  dailyCoverage: CoveragePoint[];
  weeklyCoverage: CoveragePoint[];
  reservePlan: {
    targetFiat: number;
    fiatGap: number;
    plannedProceeds: number;
    remainingGap: number;
    feasible: boolean;
    sales: ReserveSale[];
    basis: string;
  };
  concentration: { symbol: string; value: number; sharePct: number }[];
  missingQuoteIds: number[];
  warnings: AnalysisWarning[];
  assumptions: string[];
}

const DAY = 86_400_000;
const MONTH_DAYS = 365.25 / 12;
const STABLES = new Set([
  "USDC",
  "USDT",
  "DAI",
  "USDS",
  "USDE",
  "FDUSD",
  "PYUSD",
  "TUSD",
  "GUSD",
  "FRAX",
  "LUSD",
]);
const symbolOf = (s: string) => s.trim().toUpperCase();
const usd = (c: number) => c / 100;
function cents(value: number): number {
  const result = Math.round(value * 100);
  if (!Number.isFinite(value) || value < 0 || !Number.isSafeInteger(result))
    throw new Error(
      "Amounts must be finite, nonnegative and within safe cent precision.",
    );
  return result;
}
function sum(values: number[]): number {
  const result = values.reduce((a, b) => a + b, 0);
  if (!Number.isSafeInteger(result))
    throw new Error("Treasury total exceeds safe cent precision.");
  return result;
}
function parsedDate(value: string): number {
  // Date-only obligations are UTC calendar days; other timestamps must explicitly carry a timezone.
  if (!/^\d{4}-\d{2}-\d{2}(?:$|T.*(?:Z|[+-]\d{2}:\d{2})$)/.test(value))
    throw new Error(
      "Dates must use ISO dates or timestamps with an explicit timezone.",
    );
  const result = Date.parse(value);
  const calendarPart = value.slice(0, 10);
  if (
    !Number.isFinite(result) ||
    new Date(Date.parse(calendarPart)).toISOString().slice(0, 10) !==
      calendarPart
  )
    throw new Error("Invalid calendar date.");
  return result;
}
function bounded(value: number, min: number, max: number, name: string) {
  if (!Number.isFinite(value) || value < min || value > max)
    throw new Error(`${name} must be between ${min} and ${max}.`);
}

export function analyzeTreasury(input: AnalysisInput): TreasuryAnalysis {
  const { holdings, obligations, config, quotes, stress } = input;
  const quoteTimes = Object.values(quotes).map((q) =>
    parsedDate(q.lastUpdated),
  );
  if (!input.asOf && !quoteTimes.length)
    throw new Error("An explicit asOf timestamp is required without quotes.");
  const now = input.asOf ? parsedDate(input.asOf) : Math.max(...quoteTimes);
  const startDay = Math.floor(now / DAY) * DAY;
  const fiat = cents(config.fiatCash),
    burn = cents(config.monthlyBurn);
  bounded(config.targetReserveMonths, 0, 120, "Target reserve");
  bounded(config.minRunwayMonths, 0, 120, "Minimum runway");
  bounded(config.feeBps, 0, 9999, "Fee basis points");
  bounded(stress.volatileShockPct, 0, 100, "Volatile shock");
  bounded(stress.stableShockPct, 0, 100, "Stable shock");
  if (!["USDC", "USDT", "ALL"].includes(stress.stableSymbol))
    throw new Error("Unknown stablecoin stress selection.");
  const warnings: AnalysisWarning[] = [];
  const missingQuoteIds: number[] = [];
  const ids = new Set<string>();
  const allFlows = obligations.map((o) => {
    if (!o.id || ids.has(o.id))
      throw new Error("Obligation IDs must be unique and nonempty.");
    ids.add(o.id);
    return {
      ...o,
      cash: cents(o.amount),
      day: Math.max(
        0,
        Math.ceil(
          (Math.floor(parsedDate(o.dueDate) / DAY) * DAY - startDay) / DAY,
        ),
      ),
    };
  });
  const flows = allFlows.filter((o) => !o.recurring);
  const recurring = allFlows.filter((o) => o.recurring);
  const recurringMonthly = sum(recurring.map((o) => o.cash));
  const burnMismatch = recurringMonthly > burn;
  const residualBurn = Math.max(0, burn - recurringMonthly);
  // Preserve the original calendar day, clamping to each month's final day (Jan 31 -> Feb 28 -> Mar 31).
  const scheduledRecurring: { day: number; cash: number }[] = [];
  const projectionEnd = startDay + Math.ceil(120 * MONTH_DAYS) * DAY;
  for (const o of recurring) {
    const due = new Date(parsedDate(o.dueDate));
    scheduledRecurring.push({ day: o.day, cash: o.cash });
    const monthOffset = Math.max(
      1,
      (new Date(startDay).getUTCFullYear() - due.getUTCFullYear()) * 12 +
        new Date(startDay).getUTCMonth() -
        due.getUTCMonth(),
    );
    for (let offset = monthOffset; offset <= monthOffset + 122; offset++) {
      const month = new Date(
        Date.UTC(due.getUTCFullYear(), due.getUTCMonth() + offset, 1),
      );
      const lastDay = new Date(
        Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0),
      ).getUTCDate();
      const date = Date.UTC(
        month.getUTCFullYear(),
        month.getUTCMonth(),
        Math.min(due.getUTCDate(), lastDay),
      );
      if (date <= startDay) continue;
      if (date > projectionEnd) break;
      scheduledRecurring.push({
        day: Math.ceil((date - startDay) / DAY),
        cash: o.cash,
      });
    }
  }
  const feeFactor = 1 - config.feeBps / 10000;
  const rows = holdings.map((h) => {
    if (!Number.isInteger(h.cmcId) || h.cmcId <= 0)
      throw new Error("CMC IDs must be positive integers.");
    if (!Number.isFinite(h.amount) || h.amount < 0)
      throw new Error("Holding units must be finite and nonnegative.");
    if (!["locked", "available"].includes(h.availability))
      throw new Error("Unknown holding availability.");
    const symbol = symbolOf(h.symbol),
      q = quotes[h.cmcId];
    if (
      !q ||
      q.id !== h.cmcId ||
      symbolOf(q.symbol) !== symbol ||
      !Number.isFinite(q.price) ||
      q.price <= 0
    ) {
      if (h.amount > 0) missingQuoteIds.push(h.cmcId);
      return {
        ...h,
        symbol,
        stable: STABLES.has(symbol),
        marked: 0,
        stressed: 0,
        currentNet: 0,
        stressedNet: 0,
        price: 0,
        frozen: false,
      };
    }
    const age = now - parsedDate(q.lastUpdated);
    if (h.amount > 0 && (age > 15 * 60_000 || age < -60_000))
      warnings.push({
        code: "STALE_QUOTE",
        severity: "warning",
        message: `${symbol} quote is ${age < 0 ? "future-dated" : "older than 15 minutes"}; refresh before acting.`,
      });
    const stable = STABLES.has(symbol);
    if (stable && Math.abs(q.price - 1) >= 0.01 && h.amount > 0)
      warnings.push({
        code: "OBSERVED_DEPEG",
        severity: "warning",
        message: `${symbol} is marked at $${q.price.toFixed(4)}, at least 1% away from its assumed $1 peg.`,
      });
    const shock = stable
      ? stress.stableSymbol === "ALL" || stress.stableSymbol === symbol
        ? stress.stableShockPct
        : 0
      : stress.volatileShockPct;
    const price = q.price * (1 - shock / 100);
    return {
      ...h,
      symbol,
      stable,
      marked: cents(h.amount * q.price),
      stressed: cents(h.amount * price),
      currentNet: Math.floor(h.amount * q.price * feeFactor * 100),
      stressedNet: Math.floor(h.amount * price * feeFactor * 100),
      price,
      frozen: symbol === symbolOf(stress.accessFreezeSymbol ?? ""),
    };
  });
  const scheduledBurn = (days: number) =>
    sum([
      Math.round((residualBurn * days) / MONTH_DAYS),
      ...scheduledRecurring.filter((o) => o.day <= days).map((o) => o.cash),
    ]);
  const cashRequirement = (days: number) =>
    sum([
      scheduledBurn(days),
      ...flows.filter((o) => o.day <= days).map((o) => o.cash),
    ]);
  function runway(cash: number): {
    runwayMonths: number;
    runwayCapped: boolean;
    firstShortfallDate: string | null;
  } {
    // Binary-search first uncovered day, with a disclosed 10-year projection cap.
    const horizon = Math.ceil(120 * MONTH_DAYS);
    if (cashRequirement(horizon) <= cash)
      return {
        runwayMonths: 120,
        runwayCapped: true,
        firstShortfallDate: null,
      };
    let low = 0,
      high = horizon;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (cashRequirement(mid) > cash) high = mid;
      else low = mid + 1;
    }
    return {
      runwayMonths: Math.max(0, low - 1) / MONTH_DAYS,
      runwayCapped: false,
      firstShortfallDate: new Date(startDay + low * DAY)
        .toISOString()
        .slice(0, 10),
    };
  }
  function valuation(stressed: boolean): Valuation {
    const value = (r: (typeof rows)[number]) =>
      stressed ? r.stressed : r.marked;
    const available = rows.filter(
      (r) => r.availability === "available" && !(stressed && r.frozen),
    );
    const liquidatable = sum([
      fiat,
      ...available.map((r) => (stressed ? r.stressedNet : r.currentNet)),
    ]);
    return {
      markedTotal: usd(sum([fiat, ...rows.map(value)])),
      availableTotal: usd(sum([fiat, ...available.map(value)])),
      liquidatableTotal: usd(liquidatable),
      lockedTotal: usd(
        sum(rows.filter((r) => r.availability === "locked").map(value)),
      ),
      frozenTotal: usd(
        sum(
          rows
            .filter(
              (r) => r.availability === "available" && stressed && r.frozen,
            )
            .map(value),
        ),
      ),
      ...runway(liquidatable),
    };
  }
  const current = valuation(false),
    stressed = valuation(true);
  function coverage(days: number): CoveragePoint {
    const burnCash = scheduledBurn(days),
      oneOff = sum(flows.filter((o) => o.day <= days).map((o) => o.cash));
    const required = sum([burnCash, oneOff]);
    return {
      date: new Date(startDay + days * DAY).toISOString().slice(0, 10),
      days,
      burn: usd(burnCash),
      oneOffObligations: usd(oneOff),
      totalRequired: usd(required),
      fiatBalance: usd(fiat - required),
      currentBalance: usd(cents(current.liquidatableTotal) - required),
      stressedBalance: usd(cents(stressed.liquidatableTotal) - required),
      covered: cents(stressed.liquidatableTotal) >= required,
    };
  }
  const targetDays = Math.ceil(config.targetReserveMonths * MONTH_DAYS);
  // At least the policy burn reserve, increased if actual payroll dates bunch inside this horizon.
  const targetScheduledBurn = sum([
    Math.round(residualBurn * config.targetReserveMonths),
    ...scheduledRecurring.filter((o) => o.day <= targetDays).map((o) => o.cash),
  ]);
  const target = sum([
    Math.max(
      Math.round(burn * config.targetReserveMonths),
      targetScheduledBurn,
    ),
    ...flows.filter((o) => o.day <= targetDays).map((o) => o.cash),
  ]);
  const gap = Math.max(0, target - fiat);
  let remaining = gap;
  const sales: ReserveSale[] = [];
  // Reduce the largest volatile positions first. Stablecoin conversions are intentionally not proposed.
  const candidates = rows
    .filter(
      (r) =>
        !r.stable && !r.frozen && r.availability === "available" && r.price > 0,
    )
    .sort((a, b) => b.stressed - a.stressed || a.cmcId - b.cmcId);
  for (const r of candidates) {
    if (remaining === 0) break;
    const capacity = r.stressedNet,
      proceeds = Math.min(remaining, capacity);
    if (!proceeds) continue;
    const units = Math.min(r.amount, usd(proceeds) / (r.price * feeFactor));
    sales.push({
      cmcId: r.cmcId,
      symbol: r.symbol,
      units,
      stressedPrice: r.price,
      netProceeds: usd(proceeds),
    });
    remaining -= proceeds;
  }
  const grouped = new Map<string, number>();
  for (const r of rows)
    grouped.set(r.symbol, sum([grouped.get(r.symbol) ?? 0, r.marked]));
  if (fiat) grouped.set("FIAT", fiat);
  const total = cents(current.markedTotal);
  const concentration = [...grouped]
    .map(([symbol, value]) => ({
      symbol,
      value: usd(value),
      sharePct: total ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value || a.symbol.localeCompare(b.symbol));
  const missing = [...new Set(missingQuoteIds)].sort((a, b) => a - b);
  if (missing.length)
    warnings.push({
      code: "MISSING_QUOTE",
      severity: "critical",
      message: `No valid matching quote for CMC IDs ${missing.join(", ")}. These holdings are excluded; readiness is blocked.`,
    });
  if (current.lockedTotal)
    warnings.push({
      code: "LOCKED_ASSETS",
      severity: "info",
      message: `$${current.lockedTotal.toFixed(2)} of locked assets cannot fund obligations.`,
    });
  if (stressed.frozenTotal)
    warnings.push({
      code: "ACCESS_FREEZE",
      severity: "critical",
      message: `${symbolOf(stress.accessFreezeSymbol ?? "")} access is unavailable in this scenario.`,
    });
  if (concentration[0]?.sharePct > 50 && concentration[0].symbol !== "FIAT")
    warnings.push({
      code: "CONCENTRATION",
      severity: "warning",
      message: `${concentration[0].symbol} represents ${concentration[0].sharePct.toFixed(1)}% of marked treasury value.`,
    });
  if (gap)
    warnings.push({
      code: "FIAT_RESERVE_GAP",
      severity: "warning",
      message: `Fiat is $${usd(gap).toFixed(2)} below the ${config.targetReserveMonths}-month obligation reserve.`,
    });
  if (remaining)
    warnings.push({
      code: "PLAN_INFEASIBLE",
      severity: "critical",
      message: `Available volatile assets cannot fill the reserve: $${usd(remaining).toFixed(2)} remains unfunded. No stablecoin sale is assumed.`,
    });
  if (flows.some((o) => o.day === 0))
    warnings.push({
      code: "DUE_NOW",
      severity: "warning",
      message:
        "Due-today and overdue one-off obligations are included immediately.",
    });
  if (recurring.length)
    warnings.push({
      code: "RECURRING_INCLUDED",
      severity: "info",
      message:
        "Recurring rows schedule their share of monthly burn on their due dates; remaining burn accrues daily. They are not counted twice.",
    });
  if (burnMismatch)
    warnings.push({
      code: "BURN_MISMATCH",
      severity: "critical",
      message:
        "Recurring obligations exceed monthly burn. Update monthly burn; readiness is blocked and scheduled recurring costs are still included conservatively.",
    });
  const minRequired = cashRequirement(
    Math.ceil(config.minRunwayMonths * MONTH_DAYS),
  );
  const atRisk =
    cents(stressed.liquidatableTotal) < minRequired ||
    gap > 0 ||
    warnings.some((w) => ["STALE_QUOTE", "OBSERVED_DEPEG"].includes(w.code));
  return {
    asOf: new Date(now).toISOString(),
    readiness:
      missing.length || burnMismatch ? "blocked" : atRisk ? "at-risk" : "ready",
    current,
    stressed,
    dailyCoverage: Array.from({ length: 91 }, (_, d) => coverage(d)),
    weeklyCoverage: Array.from({ length: 14 }, (_, w) =>
      coverage(Math.min(w * 7, 90)),
    ),
    reservePlan: {
      targetFiat: usd(target),
      fiatGap: usd(gap),
      plannedProceeds: usd(gap - remaining),
      remainingGap: usd(remaining),
      feasible: !missing.length && !burnMismatch && remaining === 0,
      sales,
      basis:
        "Planning only: stressed marks less configured fee, largest available volatile holding first. No execution, market depth or slippage guarantee.",
    },
    concentration,
    missingQuoteIds: missing,
    warnings,
    assumptions: [
      "All inputs and obligations are USD-denominated.",
      "Recurring rows replace their share of monthly burn and repeat monthly on their due date (clamped to month end); remaining burn accrues daily using 365.25 / 12 days per month.",
      "Past-due obligations are payable immediately; historical missed recurring periods are not invented.",
      "Locked and scenario-frozen holdings cannot fund obligations.",
      "Runway uses fee-adjusted asset marks and scheduled obligations, capped at 120 months.",
      "CMC reported volume is context only and is never treated as executable liquidity.",
      "Cash sums are rounded to cents; asset units retain floating-point precision. Actual proceeds require execution quotes.",
    ],
  };
}
