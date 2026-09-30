# Runway Guard

## Inspiration

A crypto treasury can look healthy on a dashboard while the next payroll payment remains exposed to falling prices, a stablecoin depeg, or locked funds. The idea behind Runway Guard is to connect the balance to the bill: can the assets you can actually access cover the obligations coming due?

## What it does

Runway Guard helps small crypto-native teams check their operating runway. Enter BTC, ETH, SOL, USDC and USDT balances, add fiat cash and operating costs, and schedule payroll or one-off expenses. Real CoinMarketCap quotes power the current valuation. Adjustable stress scenarios show what changes when prices fall or access to an asset disappears.

The application excludes locked holdings from funding calculations, compares current and stressed coverage, and estimates the volatile assets needed to fill a chosen fiat reserve. Users can preserve a report with the inputs, market observations and assumptions behind the result. The reserve estimate is planning only. The application does not trade or execute payroll.

## How we built it

The calculation engine uses canonical CoinMarketCap IDs and batched USD quotes from `/v3/cryptocurrency/quotes/latest`. Cash totals use cent precision. Monthly payroll schedules its share of total operating burn, so the same expense does not appear twice. The interface makes the scenario assumptions and data evidence inspectable.

The working CMC integration uses the production keyless public route. Participant campaign-key evidence remains pending. The interface runs on Firebase Hosting. A shared server-side CMC integration supplies market data. The account implementation uses Firebase Authentication and Firestore.

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
