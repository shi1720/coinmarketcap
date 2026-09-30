# Runway Guard

## Inspiration

A crypto treasury can look healthy on a dashboard while the next payroll payment remains exposed to falling prices, a stablecoin depeg, or locked funds. The idea behind Runway Guard is to connect the balance to the bill: can the assets you can actually access cover the obligations coming due?

## What it does

Runway Guard helps small crypto-native teams check their operating runway. Enter BTC, ETH, SOL, USDC and USDT balances, add fiat cash and operating costs, and schedule payroll or one-off expenses. Real CoinMarketCap quotes power the current valuation. Adjustable stress scenarios show what changes when prices fall or access to an asset disappears.

The application excludes locked holdings from funding calculations, compares current and stressed coverage, and estimates the volatile assets needed to fill a chosen fiat reserve. Users can preserve a report with the inputs, market observations and assumptions behind the result. The reserve estimate is planning only. The application does not trade or execute payroll.

## How we built it

The calculation engine uses canonical CoinMarketCap IDs and batched USD quotes from `/v3/cryptocurrency/quotes/latest`. Cash totals use cent precision. Monthly payroll schedules its share of total operating burn, so the same expense does not appear twice. The interface makes the scenario assumptions and data evidence inspectable.

The live CMC integration uses an existing participant-owned API key. An authenticated GET /v3/cryptocurrency/quotes/latest returned HTTP 200 with all five assets. Sanitized request and response evidence is included. Earlier real keyless calls are retained as fallback evidence. The account is Basic, and the campaign Startup grant remains unverified. The interface runs on Firebase Hosting. A shared server-side CMC integration supplies market data. The account implementation uses Firebase Authentication and Firestore.

## Challenges we ran into

The difficult part was defining what the numbers mean. Marked value is different from accessible money. Scheduled payroll behaves differently from a cost that accrues each day. A missing quote must not quietly become a reassuring answer. Aggregate market volume cannot guarantee sale proceeds.

We handled these distinctions with explicit availability settings, dated obligations, validation and visible assumptions. We also handled CMC's V3 response format directly rather than relying on older examples.

## Accomplishments that we're proud of

Runway Guard turns live market data into a concrete operating decision with a clear calculation trail. The build includes 41 passing calculation and application unit tests and three passing Firestore emulator integration tests, including denial of cross-account access and report immutability. An additional 25 live Firestore checks pass for the exercised ownership, cross-account access and immutable-report paths. The product also includes scenario controls and preserved report exports. It presents a focused workflow instead of asking the user to interpret another price chart.

## What we learned

The useful answer is not just a dollar total. It is a dollar total tied to a date, an availability assumption and a specific expense. Small accounting choices, such as counting payroll twice or treating locked tokens as spendable, can materially change the answer. Making those choices visible builds a better product.

## What's next for Runway Guard

Validate the workflow with founders and finance operators before expanding it. Test whether the report helps them complete a real payment-readiness review and whether they would pay to keep using it. Potential next steps include scheduled checks and integrations with existing treasury tools. Billing, alerts and team collaboration are future work. Confirm the applicable CMC license before a paid B2B launch.

**Built by Shivam Gupta.** No customer traction or revenue is claimed.


## Try it and testing instructions

Live app: https://runway-guard-cmc.web.app

Narrated demo with English captions: https://youtu.be/0XljJqixhMU

1. Open the public Northstar sample. Its balances are fictional; the CMC quotes are real.
2. Open Treasury & obligations. Inspect the locked BTC row and the dated payroll and infrastructure expense. Import the example CSV or enter your own sample values.
3. Open Stress lab. Try Crash + depeg and USDC access frozen. Inspect the coverage chart and reserve what-if. Preview does not change your balances.
4. Inspect API evidence to see the exact authenticated endpoint, quote timestamps and raw response. Sanitized captured code and response are in https://github.com/shi1720/coinmarketcap/tree/main/evidence.
5. Sign in with Google or a guest account, save a workspace and a decision record, then reload to verify persistence. Records belong to the signed-in account. Guest accounts on different browsers are separate.

Full testing instructions: https://github.com/shi1720/coinmarketcap/blob/main/docs/TESTING-INSTRUCTIONS.md

## API feedback

CMC made consistent, timestamped marks across five canonical assets possible in one batched call. V3 uses arrays for assets and quotes, which required explicit normalization instead of copying older examples. A shared five-minute cache, in-flight deduplication and bounded retries reduce requests. Market marks and aggregate volume do not provide an executable conversion price, settlement guarantee or access to locked funds. The product keeps those assumptions visible rather than presenting a reserve estimate as a guaranteed trade.