# Release verification - 30 September 2026

Observed results, not a production security certification.

- 41 calculation and application unit tests pass.
- Three Firestore emulator integration tests pass, including cross-account access denial and report immutability.
- Firebase Hosting deployment succeeded at https://runway-guard-cmc.web.app.
- Google sign-in succeeded live as Shivam Gupta. Google and anonymous providers are enabled, and the Firebase domain is authorized.
- The deployed browser displayed genuine keyless CMC quotes.
- 25/25 live production Firestore REST checks passed using two distinct ephemeral anonymous-auth identities. See [Live-Privacy-Test.md](Live-Privacy-Test.md) for the exercised access, revision and report-immutability paths.

## Verification limits

Live Google sign-in and production-service storage checks provide separate evidence. The 25 REST checks verify exercised ownership, cross-account rejection, revisions and immutable reports. They do not certify every account-linking or Google-provider UI path. A final report export walkthrough remains useful. Guest-to-existing-Google account transition succeeded live and restored Shivam Gupta's existing workspace without a blocked second popup. Firebase report calculations run locally and do not carry independent backend financial attestation.

## Submission status

The participant-owned campaign CMC key and authenticated call evidence remain unavailable. Do not claim own-key compliance. Registration, eligibility, video upload, DoraHacks entry and X post require their own confirmation. No customer traction or revenue is claimed.
