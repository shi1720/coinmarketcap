# Submission and release checklist

**Owner: Shivam Gupta.** Check a box only after observing the result. This checklist is not a claim that every item is complete.

## Deadline and eligibility

- [ ] Verify DoraHacks registration through the [official hackathon page](https://coinmarketcap.com/api/resources/api-hackathon/) and the participant's matching CMC account email.
- [ ] Verify eligibility and team size under the official rules.
- [ ] Submit before **30 September 2026, 23:59 UTC**, equivalent to **1 October 2026, 05:29 IST**. Aim earlier.
- [ ] Select exactly one track: **Markets and Trading Tools**.

## Real API evidence

- [x] Inspect a fresh successful response from `/v3/cryptocurrency/quotes/latest` in the application.
- [x] Capture endpoint, safe request parameters, response and timestamps without any API secret.
- [x] Configure the existing participant-owned CMC key server-side and capture authenticated HTTP 200 five-asset request/response evidence. Campaign Startup access remains unverified.
- [x] Verify graceful failure, stale quote warnings and missing-quote blocked readiness.
- [ ] Verify the public repository contains no keys, account cookies or private workspace records.

## Working product

- [x] Public deployment published: https://runway-guard-cmc.web.app (confirmed by successful Firebase Hosting deployment status).
- [ ] Open the public deployment in a fresh browser session.
- [x] Hosted sample mode works before sign-in.
- [x] Enter supported balances manually and import a valid CSV; reject malformed inputs.
- [x] Verify USD cash, monthly burn, scheduled monthly payroll and one-off obligations.
- [x] Verify recurring payroll is included within monthly burn, not double-counted.
- [x] Verify locked holdings are excluded from obligation funding.
- [x] Verify scenario-frozen holdings are excluded only in the stressed case.
- [x] Verify the current/stress chart and reserve what-if update after inputs change.
- [x] Verify missing or stale data cannot produce an unqualified reassuring state.
- [x] Local mock sign-in, save, reload and report persistence verified.
- [ ] Hosted sign-in/save/reload: email verification code required; not completed.
- [ ] Verify a different identity cannot access another user's workspace or reports.
- [x] Save a report, change inputs, and verify the earlier report remains unchanged.
- [ ] Export JSON and open the printable report; inspect readability and assumptions.
- [x] Run the calculation tests, type checks and build; record actual outcomes in the README or verification notes.
- [ ] Inspect desktop and mobile layouts, keyboard navigation and empty/error states.

## Public deliverables

- [x] Public repository: https://github.com/shi1720/coinmarketcap (confirmed by successful Firebase Hosting deployment status).
- [ ] Verify README setup steps, actual deployed URL, endpoint, limitations and attribution.
- [ ] Replace submission placeholders with real deployment and video URLs.
- [ ] Record the demo using `DEMO-SCRIPT.md`; confirm narrated capabilities match the deployed app.
- [ ] Upload a publicly viewable demo video.
- [ ] Submit the DoraHacks entry and verify its public URL.
- [ ] Replace X draft placeholders, check length and publish the required #BuildwithCMC post linking submission and video.
- [ ] Verify all links from a signed-out browser.

## Honest claims and commercial follow-up

- [x] Credit Shivam Gupta without inventing specific personal coding actions or lived customer experiences.
- [x] Do not claim users, revenue, billing, alerts, team permissions, wallet sync, execution or autonomous trading.
- [x] Label stress assumptions and reserve estimates as planning, not predictions or execution guarantees.
- [x] Name only the CMC endpoint actually integrated.
- [x] Keep campaign-key status accurate across submission, README, script and application.
- [x] Treat pricing as a hypothesis and licensing confirmation as a paid B2B launch dependency.
- [x] Distinguish observed verification from future production hardening.

Official source: [Build with CMC rules and submission requirements](https://coinmarketcap.com/api/resources/api-hackathon/).

Observed checks and limits: see [VERIFICATION.md](VERIFICATION.md).
