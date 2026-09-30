# Runway Guard

**Can your crypto treasury still pay your team?**

Built by **Shivam Gupta** for Build with CMC. Track: **Markets and Trading Tools**.

[Demo](https://runway-guard.sg127977958.chatgpt.site) · [Submission description](docs/SUBMISSION.md) · [Verbatim video script](docs/DEMO-SCRIPT.md) · [Business hypothesis](docs/BUSINESS.md)

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
- Platform-managed ChatGPT sign-in, one private D1 workspace per user, optimistic save revisions and owner-scoped report history.
- Fixed report snapshots with all inputs, raw CMC response, timestamps and analysis. JSON and escaped printable HTML exports.
- Optional browser WebMCP tools for read-only readiness and temporary stress calculations, feature-detected in supported browsers.

## CoinMarketCap integration

The integrated endpoint is **`GET /v3/cryptocurrency/quotes/latest`**, in USD, batched for five IDs.

Without a key, the server calls:

```text
https://pro-api.coinmarketcap.com/public-api/v3/cryptocurrency/quotes/latest?id=1,1027,5426,3408,825&convert=USD
```

With `CMC_API_KEY`, it uses the authenticated root and `X-CMC_PRO_API_KEY` header. The key stays in the server environment and never enters browser responses, evidence files or Git. V3 assets and their quotes are arrays; the normalizer requires matching IDs, symbols, valid prices and USD timestamps.

The cache lasts five minutes, uses D1 plus isolate memory, and shares in-flight refreshes. Storage failure preserves a successful upstream response. Network errors, 429 and 5xx get at most three attempts with bounded timeouts and backoff. Permanent HTTP failures do not retry. Failed refreshes use labelled stale evidence and a 30-second cooldown. Missing prices are excluded and block readiness.

**Hackathon compliance:** real keyless CMC calls are captured in [evidence](evidence/README.md). The participant-owned campaign key, authenticated evidence and DoraHacks registration are still pending. Keyless availability does not waive the hackathon’s own-key rule.

## Run locally

Prerequisites: Node.js **22.13+**, npm, and internet access for CMC quotes. No paid LLM or API key is required for the public-data mode.

```bash
git clone https://github.com/shi1720/coinmarketcap.git
cd coinmarketcap
npm ci
cp .env.example .env.local
# Optional: edit .env.local and set CMC_API_KEY privately.
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_thick_kitty_pryde.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_huge_shaman.sql
npm run dev
```

Open the URL printed by the server, normally `http://127.0.0.1:5173`. Portable development supplies a loopback-only mock sign-in (`seedy@sites.test`), clearly limited to development. Hosted authentication belongs to the Sites dispatcher and is absent from the client bundle.

Migrations must run once per fresh local database. Do not replay SQL against a populated database. `npm run db:generate` creates new migrations when schema changes. Production Sites publication applies versioned migrations.

### Verify

```bash
npm run typecheck
npm test
# With the local dev server running:
npm run test:api
npm run build
```

The pure suite covers valuation, payroll dates and leap years, zero burn, locked/frozen assets, missing/future/stale quotes, conservative conversion rounding, CSV, provenance, escaped reports, cache failures/deduplication, retry limits and WebMCP calculation functions. HTTP checks exercise anonymous/forged identity rejection, origin checks, duplicate-ID rejection, durable saves, revision conflicts, immutable records and real CMC quotes.

HTTP mutation tests refuse non-loopback targets. They preserve an existing development workspace, but create sample report records in the development database.

## Architecture

```text
Browser workspace and scenario
  ├─ deterministic analysis (lib/analysis.ts)
  ├─ GET /api/market → shared cache → CMC batched quotes
  ├─ PUT /api/workspace → server identity + origin + revision → D1
  └─ POST /api/reports → fresh CMC snapshot + server analysis → fixed D1 record
```

- `app/`: pages and server routes.
- `components/dashboard.tsx`: interactive product surface using accessible UI primitives and charts.
- `lib/analysis.ts`: dependency-free financial model, integer-cent cash accounting.
- `lib/cmc*.ts`, `lib/market-service.ts`: quote validation, retries and cache behavior.
- `lib/workspace.ts`, `lib/csv.ts`, `lib/report.ts`: input schema, CSV and escaped reports.
- `db/schema.ts`, `drizzle/`: storage schema and immutable migrations.
- `tests/`, `scripts/test-api.mjs`: deterministic and HTTP verification.
- `docs/`: submission, business assumptions, recording script and release checklist.

## Deployment and trust boundary

This build targets Cloudflare Workers and D1 through Sites. `.openai/hosting.json` declares the logical `DB` binding. Production secrets are managed through Sites and applied with deployment. Public visitors see the sample; private reads and writes require a server-supplied authenticated identity.

The auth boundary relies on the Sites dispatcher stripping untrusted `oai-authenticated-user-*` headers and supplying verified identity. Do not expose the worker directly as an authenticated service. Self-hosting requires an equivalent trusted authentication gateway. SQL always scopes workspace and report data to that identity. Writes require a matching request origin, and private responses use `Cache-Control: no-store`.

## Scope and launch dependencies

This is a complete planning workflow, with intentionally bounded scope. It supports one workspace per account and five assets in USD. Wallet synchronization, bank verification, alerts, billing, multiuser approvals and execution are not implemented. CMC marks cannot establish executable liquidity, fees, redemption access or settlement timing. Reported volume never determines liquidation capacity.

Proposed $29/$79 plans and the target customer are business hypotheses, not validated traction. Confirm CMC licensing for a paid B2B workflow and complete operational security, retention/deletion and monitoring review before commercial launch. See [BUSINESS.md](docs/BUSINESS.md) and [SECURITY.md](SECURITY.md).

## References

[CMC quote reference](https://coinmarketcap.com/api/documentation/pro-api-reference/cryptocurrency) · [Keyless API](https://coinmarketcap.com/api/documentation/pro-api-reference/keyless-public-api) · [Hackathon](https://coinmarketcap.com/api/resources/api-hackathon/) · [Model and privacy](https://runway-guard.sg127977958.chatgpt.site/methodology)

MIT-licensed application code. CoinMarketCap data and third-party dependencies retain their respective terms.
