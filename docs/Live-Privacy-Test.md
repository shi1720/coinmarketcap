# Live Firebase privacy verification

Executed 2026-09-30T11:19:29.782Z against the deployed Firestore database for project `project-e602fb41-bce3-416f-901`.

**Result: 25/25 checks passed.** These are live production-service REST checks, separate from emulator tests.

Two distinct ephemeral Firebase anonymous-auth accounts were created using the public web SDK configuration. Their Firebase ID tokens remained in process memory and were never written, printed or committed. An authenticated anonymous account is distinct from an unauthenticated visitor, who sends no token. All stored inputs are fictional QA data.

| Check | Expected HTTP | Observed HTTP | Result |
|---|---:|---:|---|
| Account A creates its fictional workspace | 200 | 200 | PASS |
| Account B creates its fictional workspace | 200 | 200 | PASS |
| Account A reads its workspace | 200 | 200 | PASS |
| Account B reads its workspace | 200 | 200 | PASS |
| Account B cannot read A workspace | 403 | 403 | PASS |
| Account A cannot read B workspace | 403 | 403 | PASS |
| Unauthenticated visitor cannot read workspace | 403 | 403 | PASS |
| Account B cannot overwrite A workspace | 403 | 403 | PASS |
| Unauthenticated visitor cannot overwrite workspace | 403 | 403 | PASS |
| Account A cannot reuse an old revision | 403 | 403 | PASS |
| Account A updates workspace to the next revision | 200 | 200 | PASS |
| Account A creates its fictional report | 200 | 200 | PASS |
| Account B creates its fictional report | 200 | 200 | PASS |
| Account A reads its report | 200 | 200 | PASS |
| Account B reads its report | 200 | 200 | PASS |
| Account A lists its report collection | 200 | 200 | PASS |
| Account B cannot read A report | 403 | 403 | PASS |
| Account A cannot read B report | 403 | 403 | PASS |
| Account B cannot list A reports | 403 | 403 | PASS |
| Unauthenticated visitor cannot read report | 403 | 403 | PASS |
| Unauthenticated visitor cannot list reports | 403 | 403 | PASS |
| Account A cannot overwrite its saved report | 403 | 403 | PASS |
| Account B cannot overwrite A report | 403 | 403 | PASS |
| Unauthenticated visitor cannot overwrite report | 403 | 403 | PASS |
| Original report remains readable after denied writes | 200 | 200 | PASS |

Writes used the application document locations, payload fields, revision rules and server timestamp transforms from `firebase/firestore-store.ts`. No deployed rules or other users' records were changed. Two fictional workspaces and two fictional immutable reports remain under the test accounts. No deletion was attempted. Account IDs, tokens and document URLs are intentionally omitted from this report.

This verifies owner-scoped reads, cross-account rejection, unauthenticated rejection, workspace revision enforcement and create-only report behavior for the exercised paths. It is not a security certification, Google-provider UI test, retention review or proof of every possible Firebase configuration.
