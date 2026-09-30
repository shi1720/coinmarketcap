# Release verification - 30 September 2026

Observed results, not a production security certification.

- 32 deterministic tests pass. Financial dates/rounding/exclusions, parsers, retries/cache, schema, report escaping and optional WebMCP calculation functions covered.
- 24 loopback HTTP checks pass. Anonymous/forged identity rejection, same-origin writes, invalid/oversized JSON (400/413), schema rejection, durable saves, revision conflicts, immutable reports and genuine CMC quotes.
- TypeScript strict validation passes. Production build passes. GitHub Actions initial release verification succeeded; current release reruns it.
- `npm audit --omit=dev`: zero vulnerabilities at release check.
- Native Sites publication status succeeded. Hosted sample browser showed genuine five-asset CMC quotes and raw endpoint evidence, 9.2-month marked runway / 6.2 stressed months, $146,000 target and $121,000 fiat gap. Values vary with live quotes.
- Local browser: signed workspace save/reload, preserved sample provenance, immutable record creation, CSV valid/invalid, locked/frozen exclusions and hypothetical reserve preview verified.
- Desktop and 390px mobile layouts inspected. No document horizontal overflow at 390px. PDF five pages and pitch seven slides rendered and visually reviewed.

## Verification limits

Hosted ChatGPT sign-in reaches email verification; user-held verification code is required. Hosted save/reload and isolation between two different hosted identities remain unverified. Owner scoping is implemented and local forged-header rejection is verified. Report output generation/escaping and immutable API records pass; automated browser download completion was not confirmed. The browser lacks native WebMCP registration support, so only pure tool functions were tested. Screenshots use fictional sample balances and real CMC quotes.

## Submission gates

Participant-owned campaign key and authenticated evidence, matching CMC registration email, eligibility, narrated video upload, DoraHacks entry and X post are pending. No customer demand, revenue or paid licensing validation is claimed. Commercial launch requires operational monitoring, backups/restore, retention/deletion and an independent security review.
