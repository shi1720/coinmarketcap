# Submission and release checklist

**Owner: Shivam Gupta.** Check a box only after observing the result. This checklist is not a claim that every item is complete.

## Deadline and eligibility

- [ ] Verify DoraHacks registration through the [official hackathon page](https://coinmarketcap.com/api/resources/api-hackathon/) and the participant's matching CMC account email.
- [ ] Verify eligibility and team size under the official rules.
- [ ] Submit before **30 September 2026, 23:59 UTC**, equivalent to **1 October 2026, 05:29 IST**. Aim earlier.
- [ ] Select exactly one track: **Markets and Trading Tools**.

## Real API evidence

- [ ] Inspect a fresh successful response from `/v3/cryptocurrency/quotes/latest` in the application.
- [ ] Capture endpoint, safe request parameters, response and timestamps without any API secret.
- [ ] Configure the participant-owned campaign key server-side and capture authenticated response evidence.
- [ ] Verify graceful failure, stale quote warnings and missing-quote blocked readiness.
- [ ] Verify the public repository contains no keys, account cookies or private workspace records.

## Working product

- [ ] Open the public deployment in a fresh browser session.
- [ ] Verify sample mode works before sign-in.
- [ ] Enter supported balances manually and import a valid CSV; reject malformed inputs.
- [ ] Verify USD cash, monthly burn, scheduled monthly payroll and one-off obligations.
- [ ] Verify recurring payroll is included within monthly burn, not double-counted.
- [ ] Verify locked holdings are excluded from obligation funding.
- [ ] Verify scenario-frozen holdings are excluded only in the stressed case.
- [ ] Verify the current/stress chart and reserve what-if update after inputs change.
- [ ] Verify missing or stale data cannot produce an unqualified reassuring state.
- [ ] Sign in with ChatGPT, save, reload and verify the saved workspace.
- [ ] Verify a different identity cannot access another user's workspace or reports.
- [ ] Save a report, change inputs, and verify the earlier report remains unchanged.
- [ ] Export JSON and open the printable report; inspect readability and assumptions.
- [ ] Run the calculation tests, type checks and build; record actual outcomes in the README or verification notes.
- [ ] Inspect desktop and mobile layouts, keyboard navigation and empty/error states.

## Public deliverables

- [ ] Verify the repository is public at https://github.com/shi1720/coinmarketcap.
- [ ] Verify README setup steps, actual deployed URL, endpoint, limitations and attribution.
- [ ] Replace submission placeholders with real deployment and video URLs.
- [ ] Record the demo using `DEMO-SCRIPT.md`; confirm narrated capabilities match the deployed app.
- [ ] Upload a publicly viewable demo video.
- [ ] Submit the DoraHacks entry and verify its public URL.
- [ ] Replace X draft placeholders, check length and publish the required #BuildwithCMC post linking submission and video.
- [ ] Verify all links from a signed-out browser.

## Honest claims and commercial follow-up

- [ ] Credit Shivam Gupta without inventing specific personal coding actions or lived customer experiences.
- [ ] Do not claim users, revenue, billing, alerts, team permissions, wallet sync, execution or autonomous trading.
- [ ] Label stress assumptions and reserve estimates as planning, not predictions or execution guarantees.
- [ ] Name only the CMC endpoint actually integrated.
- [ ] Keep campaign-key status accurate across submission, README, script and application.
- [ ] Treat pricing as a hypothesis and licensing confirmation as a paid B2B launch dependency.
- [ ] Distinguish observed verification from future production hardening.

Official source: [Build with CMC rules and submission requirements](https://coinmarketcap.com/api/resources/api-hackathon/).
