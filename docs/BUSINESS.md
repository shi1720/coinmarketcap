# Runway Guard: commercial hypothesis

**Builder: Shivam Gupta.** This is a working product with a proposed business model. There is no claimed customer traction, revenue, willingness-to-pay validation or implemented billing.

## Customer and recurring job

The initial customer hypothesis is a founder or fractional finance lead at a 5–50-person crypto-native team. They hold stablecoins and volatile tokens but owe payroll and vendors in dollars. Their recurring job is to verify coverage before a payment cycle, review a reserve policy and preserve a report for stakeholders.

The product earns a place in this workflow by explaining a specific decision: whether recorded, accessible holdings cover dated obligations under stated assumptions. Its first distribution hypothesis is direct onboarding through crypto startup communities, grant recipients and fractional finance operators. These channels have not been validated.

The March 2023 USDC disruption demonstrates why stablecoin exposure deserves an explicit scenario. Circle reported $3.3 billion of reserves held at SVB and subsequent availability after intervention. This is historical motivation, not a claim of current issuer distress. [Circle's contemporary statement](https://www.circle.com/pressroom/3-3-billion-of-usdc-reserve-risk-removed-dollar-de-peg-closes)

## Competition and positioning

| Alternative | Verified adjacent capability | Runway Guard's proposed position |
|---|---|---|
| [Safe](https://safe.global/teams) | Free treasury wallet with multisig controls, exports and developer APIs. | A planning/reporting companion before treasury execution. |
| [Request Finance](https://www.requestfinance.com/pricing) | Payroll, stablecoin payments, approvals and accounting; Growth is $250/month billed annually. | A smaller readiness tool, with potential export-based integration later. |
| [KPK](https://kpk.io/treasuries) | Bespoke mandates explicitly assess concentration, runway and liquidity. | Self-service obligation coverage for small teams rather than managed treasury mandates. |
| Spreadsheet | Flexible manual calculations and scenario planning. | Consistent market refresh, availability exclusions, dated coverage and preserved reports in one workflow. |

The reviewed sources establish adjacent competition, not an exhaustive feature comparison. We do not claim those products lack all readiness features. Runway Guard's differentiation is the narrow, understandable question it answers and the auditability of its assumptions.

## Proposed pricing, not implemented billing

| Proposed plan | Proposed price | Scope to validate |
|---|---:|---|
| Free | $0 | One workspace, manual checks and sample walkthrough. |
| Operator | $29/month | Saved obligations, report history and future scheduled checks. |
| Finance | $79/month | Future multiple workspaces and collaboration. |

Scheduled checks, collaboration and billing are roadmap items. The shipped application supports personal saved workspaces and reports; it must not advertise the proposed tiers as purchasable capabilities.

## Lean operating economics

With a shared five-minute cache, one quote batch every five minutes is **12 × 24 × 30 = 8,640 calls in a 30-day month**. Under the documented one-credit-per-250-assets rule, a five-asset USD batch is one quote credit, so this schedule uses about 8,640 quote credits. Retries, other endpoints, extra conversions and operational overhead must be budgeted separately. A shared universe avoids charging one market request per workspace. This is a design budget, not a claim that a background scheduler is deployed.

Current CMC pricing lists Basic at 15,000 credits/month, Builder at 150,000 and Startup at 450,000. Annual billing displays $29/month for Builder and $79/month for Startup; annual page totals imply standard monthly rates of $35 and $95. Prices can change. [CMC pricing](https://coinmarketcap.com/api/pricing/)

Core calculations are deterministic, so they require no LLM token spend. Hosting, storage, authentication, monitoring, support and backups still have costs. Free infrastructure tiers can support a pilot, but a reliable commercial operation needs measured usage and a paid-infrastructure budget.

## Launch dependencies and risk

**Licensing:** Confirm the applicable CMC license for paid B2B treasury use. The current pricing FAQ permits commercial integration but also describes end users using the product for personal, non-commercial purposes. Its linked agreement did not expose substantive terms during review. This ambiguity is a launch dependency, not legal clearance. Do not redistribute CMC data as a standalone data service. [CMC pricing and licensing FAQ](https://coinmarketcap.com/api/pricing/)

**Execution:** CMC aggregate prices and volume cannot guarantee liquidation, slippage, settlement or access. The product must keep distinguishing marked value, availability, fee-adjusted planning value and fiat cash.

**Trust:** A saved report is only as reliable as the entered balances, obligations and quote freshness. Production hardening should include monitored failures, backups with restore drills, retention controls and additional independent security review. Immutable means the report snapshot is preserved by the application; it is not a claim of cryptographic tamper-proof certification.

**Moat:** Quotes alone are not defensibility. The proposed path is trusted workflow adoption, accumulated policies and obligation history, and useful integrations. There is no present claim of a proprietary data moat.

## Next validation experiments

1. Observe five finance operators doing their next payment-readiness check; record where the app saves time or omits a required input.
2. Ask them to compare a Runway Guard report with their existing spreadsheet and identify errors or missing assumptions.
3. Offer a paid pilot at the proposed Operator price; use actual acceptance and retention, not survey enthusiasm, to judge demand.
4. Measure support time, quote credits, storage growth and repeat report use before expanding features.
