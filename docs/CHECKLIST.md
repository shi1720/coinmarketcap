# Submission and release checklist

**Owner: Shivam Gupta.** Check a box only after observing the result. This checklist is not a claim that every item is complete.

## Deadline and eligibility

- [x] Verify DoraHacks registration on the correct participant account.
- [x] User confirmed the participant agreement at the action step. No independent eligibility certification is claimed.
- [x] Submitted before **30 September 2026, 23:59 UTC**, equivalent to **1 October 2026, 05:29 IST**. Aim earlier.
- [x] Selected track: **Markets and Trading Tools**.

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
- [x] Firebase Google and guest sign-in/save/reload verified. Guest-to-existing-Google transition restores the existing workspace.
- [x] Verify ownership through 25/25 live REST privacy checks using two separate anonymous-auth identities, plus three emulator rule tests.
- [x] Save a report, change inputs, and verify the earlier report remains unchanged.
- [ ] Export JSON and open the printable report; inspect readability and assumptions.
- [x] Run the calculation tests, type checks and build; record actual outcomes in the README or verification notes.
- [ ] Inspect desktop and mobile layouts, keyboard navigation and empty/error states.

## Public deliverables

- [x] Public repository: https://github.com/shi1720/coinmarketcap (confirmed by successful Firebase Hosting deployment status).
- [ ] Verify README setup steps, actual deployed URL, endpoint, limitations and attribution.
- [x] Use the verified Firebase, YouTube and BUIDL URLs.
- [x] Publish the final 131.328-second authenticated demo, 17 scenes and 35 caption cues: https://youtu.be/CYLWG-bSSB8.
- [x] Publish YouTube video: https://youtu.be/CYLWG-bSSB8. Playback verified.
- [x] Submit the DoraHacks entry: https://dorahacks.io/buidl/49254. Confirmed under review. Public visibility awaits moderation.
- [x] Publish the required X post linking BUIDL and YouTube with #BuildwithCMC: https://x.com/ShivamGuptaim/status/2105269446298550656.
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
