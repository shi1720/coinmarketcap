# Release verification - 30 September 2026

Observed results, not a production security certification.

- 41 calculation and application unit tests pass.
- Three Firestore emulator integration tests pass, including cross-account access denial and report immutability.
- Firebase Hosting deployment succeeded at https://runway-guard-cmc.web.app.
- Google sign-in succeeded live as Shivam Gupta. Google and anonymous providers are enabled, and the Firebase domain is authorized.
- The deployed browser displayed authenticated live CMC quotes after an existing participant-owned key was configured server-side. A five-asset authenticated quote request returned HTTP 200. Earlier keyless evidence is retained.
- 25/25 live production Firestore REST checks passed using two distinct ephemeral anonymous-auth identities. See [Live-Privacy-Test.md](Live-Privacy-Test.md) for the exercised access, revision and report-immutability paths.

## Verification limits

Live Google sign-in and production-service storage checks provide separate evidence. The 25 REST checks verify exercised ownership, cross-account rejection, revisions and immutable reports. They do not certify every account-linking or Google-provider UI path. A final report export walkthrough remains useful. Guest-to-existing-Google account transition succeeded live and restored Shivam Gupta's existing workspace without a blocked second popup. Firebase report calculations run locally and do not carry independent backend financial attestation.

## Submission status

An existing participant-owned CMC key is configured in the server runtime, and authenticated HTTP 200 five-asset evidence is captured. The account is Basic. Campaign Startup access remains unverified, so do not claim the campaign grant or complete event compliance. YouTube publication, the X post and final hackathon submission are confirmed. DoraHacks public visibility awaits moderation. Eligibility and campaign grant status retain their separate verification requirements. No customer traction or revenue is claimed.
