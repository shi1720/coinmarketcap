# Final independent judge review

**Runway Guard, built by Shivam Gupta**  
**Review date:** 30 September 2026  
**Track:** Markets and Trading Tools  
**Estimated product score: 89/100. This is an internal review, not an official judge score or a prediction of winning.**

[Live application](https://runway-guard-cmc.web.app) · [YouTube demo](https://youtu.be/0XljJqixhMU) · [Hosted demo](https://runway-guard-cmc.web.app/demo.html) · [DoraHacks BUIDL](https://dorahacks.io/buidl/49254) · [Published X post](https://x.com/ShivamGuptaim/status/2105282566807015714) · [Public repository](https://github.com/shi1720/coinmarketcap)

## Rubric assessment

| Criterion | Score | Evidence and remaining deduction |
|---|---:|---|
| Does it work | **29/30** | Recorded release evidence includes 41 unit tests, three Firestore rule tests and passing CI for source revision `b647` (CI run `36712404738`, reported successful by the implementation owner). I independently performed the documented 25 live Firebase privacy checks: both account owners could save/read fictional records, cross-account and unauthenticated requests were rejected, workspace revisions were enforced and report overwrites were rejected. The implementation owner also observed live Google and guest save/reload/report workflows and the repaired guest-to-existing-Google transition. Operational monitoring, recovery and availability over time are not demonstrated by these checks. |
| Usefulness to a real person | **22/25** | The product answers a finance operator's concrete question: can dated payroll and bills be covered using available assets and fiat? Payment cliffs, locked holdings, access freezes, stablecoin stress and saved decision records give it a coherent repeatable job. There are no validated customers, paid pilots or measured reductions in work yet. |
| Interesting use of the API | **14/20** | Genuine authenticated CMC V3 quotes for five canonical IDs become obligation coverage, fiat reserve gaps and conversion what-ifs, with inspectable sanitized raw response evidence. An existing participant-owned key returned HTTP 200 for all five assets; the live Firebase source badge displayed authenticated fresh data at 11:56 UTC. The API supplies real prices and timestamps rather than decorative charts. The integration uses one quote endpoint; its API breadth and novelty are below an exceptional multi-endpoint research or automation entry. |
| Code quality and documentation | **14/15** | Deterministic cent accounting, explicit assumptions, malformed-response guards, retries, cache failure handling, schemas, private Firestore rules, immutable stored snapshots and revision conflicts have meaningful verification. Documentation explains Firebase hosting and the retained shared market backend, local setup, test commands, limitations and trust boundaries. Browser-calculated reports have no independent backend financial attestation, and operational retention/recovery procedures remain launch work. |
| Presentation | **10/10** | The question-led interface, fiat-shortfall story, responsive screens, source evidence, report exports, pitch materials and captioned narrated 2:18 demo provide a clear demonstration. The presentation consistently separates fictional balances, real CMC prices and assumed scenarios. The replacement YouTube upload has burned captions and a 33-cue SRT published in Studio, with the watch-page CC control not yet verified, with natural AI narration transparently disclosed. Playback of the replacement video is verified at 46 seconds with readyState 4 and no media error. This score does not imply judging success or moderation approval. |
| **Total** | **89/100** | Strong product execution, with customer validation and distinctive API depth providing the largest remaining opportunities. |

## What makes the entry stand out

The strongest opening is already present in the product: **the treasury has months of marked runway, but fiat cannot cover the next payroll.** This is relatable, visible and decision-oriented. The sample's dated cash cliff makes the difference between asset valuation and immediately usable cash understandable in seconds.

The entry earns credibility by exposing assumptions instead of manufacturing confidence. It distinguishes locked assets, scenario-frozen assets, stablecoin marks, fiat cash and fee-adjusted planning proceeds. It does not treat CMC aggregate volume as executable liquidity. Preserved inputs and raw quote evidence help another person review the calculation later.

Treasury planning and stress testing are existing categories. The defensible claim is a focused, approachable obligation-first workflow for smaller crypto-native teams, not invention of the category or a proprietary pricing-data moat.

## Commercial viability

The customer and recurring job are plausible: small crypto-funded teams and fractional finance operators checking the next payment cycle. Manual onboarding, deterministic calculations and a shared five-asset price cache keep the initial service relatively lean. They do not establish actual unit economics, acquisition cost or willingness to pay.

Proposed $29/$79 plans remain hypotheses. Billing, alerts, collaboration and integrations are not shipped, so the current product should be sold or tested only on capabilities it actually provides. The next meaningful validation is a finance operator comparing this report with their current spreadsheet, followed by a paid-pilot offer. Expanding the asset universe before obtaining that evidence would not automatically improve commercial viability.

The current architecture depends on both Firebase and a retained Sites market service. Hosting and quote-cache costs, authentication usage, Firestore writes, support, backups and licensing must be measured before making margin claims. The application's deterministic calculation path has no LLM inference cost. CMC licensing for a paid B2B workflow remains an explicit unresolved launch dependency.

## Submission status is separate from judging outcome

**The hackathon entry was submitted and is under review.** The implementation owner observed the BUIDL Submitted confirmation for Runway Guard and Build with CMC, followed by an Under Review state and a Manage Submission control. Markets and Trading Tools was selected. The score is an internal product assessment and does not establish moderation approval, official eligibility acceptance or a prize result.

- The existing CMC key on the correct participant account was verified through an authenticated `GET /v3/cryptocurrency/quotes/latest` call returning HTTP 200 and all five assets. It is stored as a server secret in the retained Sites market service, not in browser configuration. Sanitized evidence is saved in `evidence/cmc-authenticated-response.json` and `evidence/cmc-request.json`. The live Firebase source badge displayed authenticated fresh data at 11:56 UTC. The account is on Basic; receipt of the campaign Startup grant and campaign issuance of this key remain unverified. Do not describe the key as confirmed campaign-issued. Earlier keyless call evidence is genuine historical fallback evidence, not the current primary source.
- A public repository, deployed working application and hosted narrated recording exist. The user confirmed the upload terms at the action step, and the public YouTube demo is published at https://youtu.be/0XljJqixhMU. Playback of the replacement video is verified at 46 seconds with readyState 4 and no media error. English burned captions are present, and the 33-cue SRT track is published in Studio, with the watch-page CC control not yet verified. Natural AI narration is transparently disclosed.
- DoraHacks registration is verified on the correct participant account by the existing Unregister control. The profile, project story, team and user-provided contact fields are saved. The user confirmed the Terms of Use and participant agreement at the action step. The BUIDL exists at https://dorahacks.io/buidl/49254, and the actual hackathon submission was confirmed through the BUIDL Submitted modal, Under Review status and Manage Submission control. The entry is awaiting moderation; it is not described as publicly approved.
- A correction reply was published from `@ShivamGuptaim`: https://x.com/ShivamGuptaim/status/2105282566807015714. It links the DoraHacks BUIDL and YouTube demo and includes `#BuildwithCMC`. The entry therefore has concrete publication links, not placeholders. Eligibility beyond observed registration remains subject to organizer review.

Registration, contact entry, track selection, an actual participant-owned authenticated API call, accepted action-step terms, public video, required X post and actual hackathon submission are now observed facts. Campaign Startup-grant receipt, campaign issuance of the existing key, moderation approval and judging outcome remain unverified.

## Financial trust and security limits

Firebase rules enforce ownership and reject modification or deletion of saved report documents. The live checks support those specific claims. They do not certify every possible authentication state, browser, Firebase setting or attack path.

The Firebase report is calculated in the browser. A technically capable account owner can supply a fabricated payload through their own authenticated write request while complying with the Firestore field rules. A preserved report is therefore **an immutable stored user record, not an independently authenticated financial attestation**. The code and README disclose that boundary. Do not call the reports tamper-proof accounting, backend-verified solvency or certified audit evidence.

Inputs remain self-reported, CMC prices remain aggregate observations, and conversion proceeds remain planning estimates. No wallet or bank balance is independently verified. No trade, payment, settlement or redemption is executed or guaranteed.

Before commercial launch, complete monitoring, retention/deletion policy, backup and restore procedures, licensing review and independent operational security review. Test passes and CI success are evidence of exercised behavior, not production-readiness certification.

## Concrete remaining upkeep

1. Keep all final links synchronized in submission documents and the ZIP: the live application, public YouTube video, actual DoraHacks BUIDL and published X post.
2. Describe the hackathon state as submitted and under review until DoraHacks moderation changes it. Proof screenshots include `outputs/DoraHacks-Submitted.png`; a creation confirmation alone is not the evidence used for this claim.
3. Preserve the Basic-plan/campaign-Startup-grant distinction. Successful use of an existing participant-owned key proves the authenticated call; it does not prove campaign issuance or a grant upgrade.
4. Preserve the browser-calculation disclosure in reports and submission copy. No new test run is warranted solely for final links or status wording.

The product is a strong, reviewable hackathon build with an actual submitted entry and published demo and social post. Its largest remaining uncertainties are organizer review, customer validation and commercial-launch operations. Winning cannot be guaranteed, and the score remains a skeptical internal estimate.

## Factual update

This final revision incorporates the authenticated CMC call, existing DoraHacks registration, saved contacts, selected track, user-confirmed terms, public captioned YouTube upload, actual X post and hackathon submission under review. The internal product score remains 89/100: completion strengthens submission status without changing endpoint breadth or validating commercial demand. The corrected-video release passed CI run `36719900226` for source revision `2623b1c`. The narration correction does not change the product score. No key, token, phone number or private contact value is included here.
