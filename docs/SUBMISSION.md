# Runway Guard

**Can your crypto treasury still pay your team?**

**Track:** Markets and Trading Tools  
**DoraHacks:** https://dorahacks.io/buidl/49254  
**Status:** Submitted to Build with CMC, under review. Public visibility awaits moderation.  
**X post:** https://x.com/ShivamGuptaim/status/2105282566807015714  
**Builder:** Shivam Gupta  
**Public repository:** https://github.com/shi1720/coinmarketcap  
**Working demo:** https://runway-guard-cmc.web.app  
**Demo video:** https://youtu.be/0XljJqixhMU
**Hosted backup:** https://runway-guard-cmc.web.app/demo.html

## The problem

A treasury balance is an asset valuation. Payroll is a dated obligation. For a small crypto-native team, a falling token price, a stablecoin depeg, or inaccessible assets can change whether the next payment is covered. A portfolio chart does not make that operating decision clear.

Runway Guard puts the obligations first: how much is available, what is due, and what happens under an explicit stress scenario?

## What works today

- Record BTC, ETH, SOL, USDC and USDT balances manually or through CSV. Add fiat cash and mark locked holdings.
- Set monthly operating burn, schedule monthly payroll within that burn, and add dated one-off obligations.
- Fetch real CoinMarketCap USD quotes and compare current and stressed coverage over time.
- Apply a volatile-asset drawdown, selected stablecoin depeg and optional asset-access freeze. Locked and scenario-frozen holdings cannot fund obligations.
- Inspect a deterministic fiat-reserve what-if, including the units of available volatile assets needed under stressed marks and a configurable fee assumption.
- Sign in with Google or create a guest account to save a personal workspace in Firestore.
- Save an immutable report snapshot, export JSON and print a formatted HTML report.
- Inspect live API evidence and the assumptions behind each calculation.

Recurring obligations schedule their share of monthly burn; they are not added twice. Remaining burn accrues daily. Past-due one-off obligations are immediately payable. Missing matching quotes block readiness; stale quotes generate warnings. These details matter because a reassuring number is useful only when its assumptions are visible.

The reserve what-if is planning only. The app does not trade, execute payroll, promise executable liquidity, run alerts, sell subscriptions or provide team permissions. All amounts are USD-denominated. Report snapshots preserve the inputs and market observations used at that time.

## CoinMarketCap integration

**Endpoint actually used:** `GET /v3/cryptocurrency/quotes/latest`.

The live server calls:

```text
https://pro-api.coinmarketcap.com/v3/cryptocurrency/quotes/latest
```

It authenticates with an existing participant-owned CMC key in the server runtime using `X-CMC_PRO_API_KEY`. A verified request returned HTTP 200 with all five supported assets, and the Firebase browser displayed authenticated live data. The key does not appear in public evidence, browser responses or the repository. The V3 parser matches canonical asset IDs and USD quote arrays.

Sanitized evidence is in `evidence/cmc-request.json` and `evidence/cmc-authenticated-response.json`. Earlier genuine calls to `/public-api/v3/cryptocurrency/quotes/latest` are retained as fallback evidence.

**Campaign access status:** The existing API account is Basic. Campaign Startup grant status remains unverified. This build demonstrates an authenticated call using the participant's existing key, but does not claim the campaign grant, paid licensing approval or complete event compliance.

**What CMC made possible:** One batched request supplies consistent prices, asset identity, timestamps and market context across volatile tokens and stablecoins. That lets the product translate market observations into operating coverage rather than present another price dashboard.

**Where it got in the way:** Quotes are aggregated marks, not executable sale prices or bank settlement guarantees. Reported volume cannot prove that this treasury can liquidate at the displayed value. The product therefore exposes a fee assumption, labels its reserve output a what-if, and excludes inaccessible assets. V3's response shape also differs from common legacy examples, so parsing and matching must be explicit. Keyless access enables a low-friction working demo but has limited endpoint coverage and rate limits.

## Originality and attribution

Runway Guard is an original build for Build with CMC, credited to Shivam Gupta. Its code uses open-source dependencies. The novel product emphasis is an approachable, obligation-first readiness workflow for small teams, with visible assumptions and preserved reports. Treasury management and stress testing have existing competitors; this submission does not claim to have invented them.

## Judge walkthrough

1. Open the sample Northstar Labs workspace and refresh CMC data.
2. Inspect holdings, the locked BTC position, fiat cash and monthly burn.
3. Apply the sample 40% volatile decline and 10% USDC depeg; inspect the stressed curve and reserve gap.
4. Edit the existing recurring payroll date within monthly burn, then add a one-off expense; verify the timing changes the coverage curve.
5. Freeze an available asset and inspect excluded value and warnings.
6. Inspect the reserve what-if and its assumptions.
7. Sign in, save the workspace, create a report and export/print it.
8. Open the API evidence view to inspect endpoint, response and timestamps.

## References

- [Hackathon requirements](https://coinmarketcap.com/api/resources/api-hackathon/)
- [CMC cryptocurrency reference](https://coinmarketcap.com/api/documentation/pro-api-reference/cryptocurrency)
- [CMC keyless public API](https://coinmarketcap.com/api/documentation/pro-api-reference/keyless-public-api)
