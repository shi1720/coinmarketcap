# Runway Guard

**Can your crypto treasury still pay your team?**

Built by **Shivam Gupta** for Build with CMC. Track: **Markets and Trading Tools**.

[Demo](https://runway-guard-cmc.web.app) · [YouTube](https://youtu.be/CYLWG-bSSB8) · [DoraHacks BUIDL](https://dorahacks.io/buidl/49254) · [X post](https://x.com/ShivamGuptaim/status/2105269446298550656) · [Submission description](docs/SUBMISSION.md) · [Verbatim video script](docs/DEMO-SCRIPT.md) · [Business hypothesis](docs/BUSINESS.md)

A crypto-funded team can have months of marked treasury value and still lack cash for Friday’s payroll. Runway Guard turns CoinMarketCap quotes and dated commitments into a repeatable operating decision.

## The demo in 90 seconds

1. Open the fictional Northstar Labs sample. It has $25,000 fiat, $42,000 monthly burn and $30,000 payroll due in seven days. Payroll is already included in burn. A $20,000 infrastructure renewal is additional.
2. Inspect ETH, SOL, USDC, USDT and locked BTC. CMC supplies real prices by numeric asset ID.
3. Compare current and stressed coverage with a 40% volatile decline and a 10% USDC decline. Fiat alone first falls short at payroll; locked BTC cannot fund it.
4. Inspect the three-month fiat target: $146,000. The $121,000 gap becomes a read-only conversion estimate using stressed prices and an explicit execution haircut.
5. Preview the hypothetical conversion. Recorded balances stay unchanged.
6. Inspect the raw CMC response and timestamps. Sign in to save your own workspace and immutable decision records. Download JSON or a printable HTML report.

All financial balances in the public sample are fictional. Market quotes are real. Scenarios are assumptions, not forecasts. The product does not execute trades or payments.

## Implemented

- Five canonical assets: BTC `1`, ETH `1027`, SOL `5426`, USDC `3408`, USDT `825`.
- Manual balances, locked/available lots, CSV import/export, fiat cash and monthly operating burn.
- Monthly commitments with real payment dates, month-end recurrence and additional one-off obligations.
- Current, stressed and fiat-only daily coverage through day 90. Runway checks a ten-year horizon and discloses its cap.
- Selective stablecoin depeg, volatile drawdown and asset-access freeze scenarios.
- Conservative cent accounting, explicit policy findings and incomplete/stale-data handling.
- Deterministic fiat reserve conversion what-if, infeasible gaps and hypothetical preview.
- Firebase Google sign-in or anonymous guest accounts, one private Firestore workspace per user, optimistic save revisions and owner-scoped report history.
- Fixed report snapshots with all inputs, raw CMC response, timestamps and analysis. JSON and escaped printable HTML exports.
- Optional browser WebMCP tools for read-only readiness and temporary stress calculations, feature-detected in supported browsers.

## CoinMarketCap integration

The integrated endpoint is **`GET /v3/cryptocurrency/quotes/latest`**, in USD, batched for five IDs.

The live backend uses an existing participant-owned CMC key and calls:

```text
https://pro-api.coinmarketcap.com/v3/cryptocurrency/quotes/latest?id=1,1027,5426,3408,825&convert=USD
```

It authenticates with the `X-CMC_PRO_API_KEY` header. A verified authenticated request returned HTTP 200 with all five assets, and the Firebase browser displayed fresh authenticated live data. The key stays in the native Sites server runtime and never enters browser responses, sanitized evidence files or Git. No new API key was created.

The account is Basic. Campaign Startup grant status remains unverified. Sanitized [request metadata](evidence/cmc-request.json) and [authenticated response](evidence/cmc-authenticated-response.json) provide reproducible evidence without publishing the key.

When no server key is configured, the same normalizer supports the genuine keyless public route at `/public-api/v3/cryptocurrency/quotes/latest`. Earlier keyless responses remain in the evidence directory as fallback and development history. V3 assets and their quotes are arrays. The normalizer requires matching IDs, symbols, valid prices and USD timestamps.

The cache lasts five minutes, uses D1 plus isolate memory, and shares in-flight refreshes. Storage failure preserves a successful upstream response. Network errors, 429 and 5xx get at most three attempts with bounded timeouts and backoff. Permanent HTTP failures do not retry. Failed refreshes use labelled stale evidence and a 30-second cooldown. Missing prices are excluded and block readiness.

**Hackathon status:** an authenticated call using the participant's existing key is verified and captured in [evidence](evidence/README.md). The Basic account does not establish receipt of the campaign Startup grant, which remains unverified. Runway Guard is submitted to Build with CMC in Markets and Trading Tools and is under review. DoraHacks public visibility awaits moderation. YouTube is public and its playback is verified. One X post links the BUIDL and YouTube video with #BuildwithCMC. The user confirmed the required platform terms and publication. Do not claim the campaign grant, paid licensing approval or complete event compliance.

## Run the Firebase application locally

Prerequisites: Node.js **22.13+**, npm, and internet access for CMC quotes. No paid LLM is required. Development can use the documented keyless route; the deployed backend now uses the participant's existing CMC key.

```bash
git clone https://github.com/shi1720/coinmarketcap.git
cd coinmarketcap
npm ci
```

Create an ignored `.env.firebase` file with your own Firebase web app configuration and a market-service origin:

```text
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_WEB_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_APP_ID=YOUR_WEB_APP_ID
VITE_MARKET_ORIGIN=https://runway-guard.sg127977958.chatgpt.site
```

Firebase web configuration is public client configuration. It is not a CMC secret or an administrator credential. Enable Google and anonymous providers, authorize your local domain in Firebase Authentication, and deploy the supplied Firestore rules to your own project before testing private saves.

```bash
npm run dev:firebase
```

Open `http://127.0.0.1:5174`. The deployed shared market origin must allow the development origin, or point `VITE_MARKET_ORIGIN` to your own backend with matching CORS configuration. The Firebase build reads `.env.firebase` through Vite's `firebase` mode.

### Verify

```bash
npm run typecheck
npm test
npm run build:firebase
```

The Firestore emulator suite uses Firebase CLI 15.32.0 and Java 21. Install Java 21 and make the Firebase CLI available as required by the repository test script:

```bash
npm run test:rules
```

It uses the isolated `demo-runway-guard` project and does not change production data. Current verification includes 41 calculation/application unit tests and three Firestore rule integration tests. The rule suite verifies owner access, cross-account denial and report immutability. Live Google sign-in and live CMC refresh are confirmed. Additionally, 25/25 live Firestore REST checks passed using two separate ephemeral anonymous-auth identities. They verify owner access, cross-account and unauthenticated rejection, revisions and preserved reports. See [Live-Privacy-Test.md](docs/Live-Privacy-Test.md).

The retained Sites backend can be built with `npm run build` and tested locally with `npm run test:api` while its local server and D1 migrations are configured. Those HTTP checks target the retained backend, not the Firebase account store. See the migration files in `drizzle/` and the local Sites setup in the original framework configuration. HTTP mutation tests refuse non-loopback targets.

## Architecture

```text
Firebase Hosting browser application
  deterministic analysis in lib/analysis.ts
  market fetch to shared server cache and batched CMC quotes
  Firebase Authentication with Google or anonymous identity
  owner-scoped Firestore workspace and fixed report snapshots
```

- `firebase/`: static entrypoint, account transport, private storage and Firestore rules.
- `components/dashboard.tsx`: shared interactive product surface.
- `lib/analysis.ts`: financial model with integer-cent cash accounting.
- `lib/cmc*.ts`, `lib/market-service.ts`: shared backend quote validation, retries and cache behavior.
- `lib/workspace.ts`, `lib/csv.ts`, `lib/report.ts`: input schema, CSV and printable reports.
- `app/`, `db/`, `drizzle/`: retained Sites backend and D1 market cache.
- `tests/`: calculation, transport and Firestore rules verification.
- `docs/`: submission materials, business hypothesis and testing walkthrough.

## Deployment and trust boundary

The public application runs at https://runway-guard-cmc.web.app on Firebase Hosting. The shared CMC market service remains on the Sites backend at https://runway-guard.sg127977958.chatgpt.site/api/market. It allows the Firebase frontend origin. The CMC key, if configured, belongs only in that server environment.

Firebase Authentication provides Google and anonymous account identities. Firestore rules enforce owner access and reject updates or deletion of fixed report snapshots. Google sign-in succeeded live as Shivam Gupta. Report calculations run locally in the Firebase browser application and preserve their input snapshot. They are not independently verified financial calculations from a trusted backend. Firestore ownership and immutability rules protect stored records, but do not certify user-supplied balances or attest that client calculations are authentic.

`npm run deploy:firebase` derives its destination from `.firebaserc`, validates that the public app configuration uses the same project, and requires an explicit Hosting site in `firebase.json`. It gates publication on type checks, unit tests, Firestore rule tests and the Firebase build, using Firebase CLI 15.32.0. A fork must supply its own matching project and site configuration. The command requires a Firebase-authorized account and does not create projects or attach billing.

```bash
npm run deploy:firebase -- --dry-run
```

Dry-run validates the destination and prints the commands without running them. CI uses Java 21, executes Firestore rule tests, and builds both the retained backend and Firebase frontend. Configure the public Firebase repository variables for the CI frontend build.

## Scope and launch dependencies

This is a complete planning workflow, with intentionally bounded scope. It supports one workspace per account and five assets in USD. Wallet synchronization, bank verification, alerts, billing, multiuser approvals and execution are not implemented. CMC marks cannot establish executable liquidity, fees, redemption access or settlement timing. Reported volume never determines liquidation capacity.

Proposed $29/$79 plans and the target customer are business hypotheses, not validated traction. Confirm CMC licensing for a paid B2B workflow and complete operational security, retention/deletion and monitoring review before commercial launch. See [BUSINESS.md](docs/BUSINESS.md) and [SECURITY.md](SECURITY.md).

## References

[CMC quote reference](https://coinmarketcap.com/api/documentation/pro-api-reference/cryptocurrency) · [Keyless API](https://coinmarketcap.com/api/documentation/pro-api-reference/keyless-public-api) · [Hackathon](https://coinmarketcap.com/api/resources/api-hackathon/) · [Model and privacy](https://runway-guard-cmc.web.app/methodology)

MIT-licensed application code. CoinMarketCap data and third-party dependencies retain their respective terms.
