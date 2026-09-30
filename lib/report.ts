import type { Workspace } from "./workspace";
import type { TreasuryAnalysis } from "./analysis";
import type { MarketSnapshot } from "./market-types";
export type DecisionRecord = {
  id: string;
  createdAt: string;
  workspace: Workspace;
  analysis: TreasuryAnalysis;
  market: MarketSnapshot;
  sample: boolean;
};
const esc = (v: unknown) =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const cash = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(v);
export function reportHTML(r: DecisionRecord): string {
  const a = r.analysis;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Runway Guard — ${esc(r.workspace.name)}</title><style>body{font:15px/1.6 Arial,sans-serif;color:#18353d;max-width:980px;margin:45px auto;padding:0 25px}h1{font-size:34px;letter-spacing:-1px}h2{margin-top:30px;font-size:20px}small{color:#536b75}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border-bottom:1px solid #dae4e7;padding:10px;text-align:left}th{background:#edf3f5}.summary{display:flex;gap:35px;padding:20px;background:#edf3f5}.summary strong{display:block;font-size:26px}.flag{background:#fff0db;padding:15px}button{padding:12px 18px;background:#18353d;color:white;border:0;border-radius:6px;cursor:pointer}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px}footer{border-top:1px solid #ddd;margin-top:30px;padding:15px 0}@media print{body{margin:0;padding:15px}.no-print{display:none}tr{break-inside:avoid}h2{break-after:avoid}}</style></head><body><button class="no-print" onclick="window.print()">Print / Save PDF</button><p><small>RUNWAY GUARD · DECISION RECORD ${esc(r.id)}</small></p><h1>${esc(r.workspace.name)}</h1><p>${r.sample ? "Sample treasury with live CMC quotes" : "User-entered treasury"} · Generated ${esc(r.createdAt)} (UTC)</p><div class="summary"><div>Current runway<strong>${a.current.runwayMonths.toFixed(1)} months</strong></div><div>Stressed runway<strong>${a.stressed.runwayMonths.toFixed(1)} months</strong></div><div>Fiat reserve gap<strong>${cash(a.reservePlan.fiatGap)}</strong></div></div><h2>Readiness: ${esc(a.readiness)}</h2><p class="flag">Planning estimate. Crypto marks are not cash in a bank. No sale, payment or transaction has been executed. Scenarios are user assumptions, not forecasts.</p><h2>Inputs and policy</h2><p>Fiat: ${cash(r.workspace.config.fiatCash)} · Monthly burn: ${cash(r.workspace.config.monthlyBurn)} · Target fiat reserve: ${r.workspace.config.targetReserveMonths} months · Minimum stressed runway: ${r.workspace.config.minRunwayMonths} months · Fee / execution haircut: ${r.workspace.config.feeBps} basis points.</p><p>Volatile decline: ${r.workspace.stress.volatileShockPct}% · ${esc(r.workspace.stress.stableSymbol)} decline: ${r.workspace.stress.stableShockPct}% · Access freeze: ${esc(r.workspace.stress.accessFreezeSymbol || "None")}</p><table><thead><tr><th>Asset / CMC ID</th><th>Units</th><th>Availability</th><th>CMC USD mark</th></tr></thead><tbody>${r.workspace.holdings.map((h) => `<tr><td>${esc(h.symbol)} / ${h.cmcId}</td><td>${h.amount}</td><td>${esc(h.availability)}</td><td>${r.market.quotes[h.cmcId] ? cash(r.market.quotes[h.cmcId].price) : "MISSING"}</td></tr>`).join("")}</tbody></table><h2>Scheduled obligations</h2><p>Recurring rows schedule amounts already included in monthly burn. One-offs are additional.</p><table><thead><tr><th>Obligation</th><th>Next due (UTC)</th><th>Amount</th><th>Cadence</th></tr></thead><tbody>${r.workspace.obligations.map((o) => `<tr><td>${esc(o.label)}</td><td>${esc(o.dueDate)}</td><td>${cash(o.amount)}</td><td>${o.recurring ? "Monthly, included in burn" : "One-off, additional"}</td></tr>`).join("")}</tbody></table><h2>Reserve conversion what-if</h2><p>Target fiat: ${cash(a.reservePlan.targetFiat)} · Estimated funding: ${cash(a.reservePlan.plannedProceeds)} · Unfunded: ${cash(a.reservePlan.remainingGap)} · ${a.reservePlan.feasible ? "Estimated feasible" : "Incomplete or infeasible"}</p><table><thead><tr><th>Asset</th><th>Estimated units</th><th>Stressed mark</th><th>Net fiat estimate</th></tr></thead><tbody>${a.reservePlan.sales.map((s) => `<tr><td>${esc(s.symbol)}</td><td>${s.units.toFixed(8)}</td><td>${cash(s.stressedPrice)}</td><td>${cash(s.netProceeds)}</td></tr>`).join("")}</tbody></table><p>${esc(a.reservePlan.basis)}</p><h2>Policy findings</h2><ul>${a.warnings.map((w) => `<li><strong>${esc(w.severity)} / ${esc(w.code)}</strong>: ${esc(w.message)}</li>`).join("") || "<li>No policy breaches identified for these assumptions.</li>"}</ul><h2>90-day coverage</h2><table><thead><tr><th>Date</th><th>Required</th><th>Fiat balance</th><th>Current net balance</th><th>Stressed net balance</th></tr></thead><tbody>${a.weeklyCoverage.map((p) => `<tr><td>${p.date}</td><td>${cash(p.totalRequired)}</td><td>${cash(p.fiatBalance)}</td><td>${cash(p.currentBalance)}</td><td>${cash(p.stressedBalance)}</td></tr>`).join("")}</tbody></table><h2>Calculation assumptions</h2><ul>${a.assumptions.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><h2>CMC evidence</h2><p>Source: ${esc(r.market.source)} · Cache: ${esc(r.market.cache)} · Retrieved ${esc(r.market.fetchedAt)}</p><pre>${esc(r.market.endpoint)}</pre><p>Each quote carries its own last-updated timestamp. Downloaded JSON contains the raw response, all inputs and full daily coverage. No API key is included.</p><footer>Runway Guard · Built by Shivam Gupta · CoinMarketCap market data · No customer traction or guaranteed execution is implied.</footer></body></html>`;
}
