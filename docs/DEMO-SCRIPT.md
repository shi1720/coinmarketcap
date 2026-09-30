# Runway Guard demo

**Speaker:** Shivam Gupta  
**Target length:** 2 minutes 45 seconds to 3 minutes, at a calm speaking pace.  
**Recording:** Capture the deployed application at readable zoom. Narration below can be read verbatim. Screen actions are separate and should not be spoken.

Before recording, refresh quotes and verify the deployed controls. Use the sample workspace: 80 ETH, 500 SOL, 80,000 USDC, 30,000 USDT, 0.5 locked BTC, $25,000 fiat, $42,000 monthly burn and a $20,000 one-off infrastructure renewal due in 14 days. Total market values change; the script intentionally avoids reading stale prices.

## Verbatim narration

Hi, I'm Shivam Gupta, and this is Runway Guard. It answers one question: can your crypto treasury still pay your team?

A balance can look healthy while the money needed for payroll is exposed to token prices, a stablecoin depeg, or an asset you cannot access. Runway Guard connects market data to the obligations that actually matter.

Here is our fictional sample team, Northstar Labs. It holds ETH, SOL, USDC and USDT, plus half a Bitcoin that is locked. There is twenty-five thousand dollars in fiat cash, forty-two thousand dollars in monthly operating costs, and an infrastructure renewal due in two weeks. These are editable sample inputs, not a real customer's finances.

I can enter balances or import a CSV. Refreshing makes a real CoinMarketCap call for all five assets. The evidence view shows the endpoint, response and timestamps, so you can inspect the data behind the numbers.

Now let's stress the treasury. I'm applying a forty percent decline to volatile assets and a ten percent depeg to USDC. These are assumptions, not predictions. The chart compares current coverage with stressed coverage as obligations become due. The locked Bitcoin contributes to marked treasury value, but it cannot pay a bill.

Payroll timing matters too. A recurring payroll row schedules its share of the monthly burn; the app does not count that expense twice. One-off obligations are additional. If I simulate losing access to USDC, its available value is excluded from the stressed case. You can see how that changes coverage and the warnings.

The reserve what-if asks how much fiat would cover our chosen reserve period. It shows a gap and a deterministic estimate of available volatile assets needed to fill it, using stressed prices and our fee assumption. It does not execute a trade. CoinMarketCap's reported volume is context, not a promise that we can sell at this price.

I can sign in with ChatGPT, save my own workspace, and preserve a report with the inputs, market snapshot, scenario and assumptions. The report exports as JSON or a clean printable document. That makes the result reviewable after prices change.

The business hypothesis is a focused tool for small crypto-native teams and their finance operators. There is no claimed customer traction or paid billing yet. The working product is the readiness workflow you just saw.

This build uses real keyless CoinMarketCap data today. Campaign-key evidence and registration still need completion before the final hackathon submission. Runway Guard turns market prices into a concrete operating question: are the next obligations covered, and what assumptions does that answer depend on?

## Screen actions

| Segment | Action |
|---|---|
| Opening | Show product header and coverage summary, with the sample workspace already loaded. |
| Sample inputs | Show holdings and locked BTC, then cash, burn and one-off obligation. |
| CMC evidence | Click refresh; open evidence and show endpoint, timestamps and a readable response fragment. Avoid secrets. |
| Stress | Show the 40% volatile and 10% USDC controls and current/stressed chart. |
| Payroll and freeze | Show the existing $30,000 monthly payroll row due in seven days within $42,000 total burn. Apply USDC access freeze, show resulting warnings, then clear the freeze before the reserve segment. |
| Reserve | Show target reserve, fiat gap, estimated asset units and planning assumptions. |
| Account/report | Use a signed-in personal workspace, save and create a report; briefly show JSON download and print view. |
| Closing | Return to the coverage summary. Hold for two seconds after the last sentence. |

## Final-recording updates

If participant campaign-key evidence and registration have been verified, replace only the penultimate sentence with: **“This build uses CoinMarketCap quotes, and the submission includes an authenticated call made with my participant API key.”** Do not make that replacement before evidence exists.

Keep real keys, email inboxes and personal account details out of the recording. Use the fictional workspace throughout. Upload the video and insert its actual URL into the submission and X draft.
