# Testing Runway Guard

Public demo: https://runway-guard-cmc.web.app
Repository: https://github.com/shi1720/coinmarketcap

## A five-minute walkthrough

1. Open the live demo and load the sample workspace. The example company and balances are fictional.
2. Refresh market data. Inspect the API evidence view for a real response from `/v3/cryptocurrency/quotes/latest`, matching asset IDs and timestamps.
3. Inspect the sample holdings and confirm locked BTC contributes to marked value but cannot fund obligations.
4. Compare current coverage with the sample 40% volatile drawdown and 10% USDC depeg. Change the assumptions and verify the curve and estimates update.
5. Add a $30,000 recurring payroll payment due in seven days within $42,000 total monthly burn. Verify that payroll schedules its share of burn instead of adding another $30,000 of monthly cost.
6. Add a one-off expense and verify it affects coverage when due. Try a past-due expense and verify it counts immediately.
7. Freeze access to an available asset. Verify its value disappears from funding in the stressed case. Clear the freeze before comparing the reserve estimate.
8. Inspect the fiat reserve what-if. Confirm it states the fee assumption and planning boundary. The app does not execute the estimated transactions.
9. Create a report and inspect its inputs, market observations and assumptions. Change the workspace and verify the earlier report preserves its original snapshot.
10. Download JSON and open the print view. Confirm both outputs remain readable.

## Failure and boundary checks

- Reject negative balances, invalid dates and unsupported assets.
- A missing matching quote must block readiness rather than imply coverage.
- Old quotes must generate a visible freshness warning.
- Recurring obligations above monthly burn must trigger a mismatch state.
- Verify that a locked or frozen asset cannot appear in the reserve funding estimate.
- Verify a preserved report remains unchanged after editing the current scenario.

## Deployment-specific account checks

Firebase Hosting is live. Google sign-in succeeded in the deployed application as Shivam Gupta. Google and anonymous account providers are enabled, and the Firebase domain is authorized. Live keyless CMC data also appeared in the deployed browser.

To test a saved account, sign in with Google or choose a guest account, save a workspace, reload it and confirm persistence. Create a report, change the workspace, and confirm the saved report does not change. In a second account, verify that the first account's records remain inaccessible. Guest accounts are tied to their Firebase anonymous identity, so use Google sign-in for a recoverable account.

Automated verification currently passes 41 calculation and application unit tests plus three Firestore emulator integration tests. The emulator tests cover cross-account access denial and report immutability. Successful live Google sign-in and CMC refresh are verified. An additional 25/25 live production Firestore REST checks passed using two distinct ephemeral anonymous-auth accounts. They cover ownership, cross-account denial, unauthenticated denial, revision enforcement and immutable reports. Guest-to-existing-Google account transition also succeeded live and restored the existing workspace without a blocked second popup. The privacy checks verify the exercised storage paths, not every possible account configuration. See the repository report `docs/Live-Privacy-Test.md`.

For reproducible automated checks from the repository root:

```bash
npm ci
npm run typecheck
npm test
npm run build:firebase
```

The Firestore integration suite additionally uses Firebase CLI 15.32.0 and Java 21 for its emulator:

```bash
npm run test:rules
```

This suite uses the isolated `demo-runway-guard` emulator project. It does not mutate production Firestore.

## Data and scope

The current integration uses real keyless CoinMarketCap data. Campaign-key evidence remains pending. Quotes are aggregated marks, not executable liquidity. Stress scenarios are assumptions, and all input amounts use USD. There are no payroll payments, autonomous trades, billing or deployed alerts.
