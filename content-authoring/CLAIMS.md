# Claims register

Every `[CLAIM]` marker in app content or logic has an entry here. Two categories carry real safety consequences and are the only ones that need the clinical reviewer's actual attention (see IMPLEMENTATION_PLAN.md, "Content schema" and Work item 4):

1. **Pelvic floor progression** — `pf-hypertonic-gate`, and the protocol levels in `src/content/protocols/pelvic-floor.json`.
2. **Red-flag intake rules** — `redflags-*` entries, defined in `src/features/intake/redFlags.ts`.

Everything else below is educational framing and lower-stakes, but is listed for completeness and for the claims-discipline check (banned-words scan) described in the plan.

Status column: `unreviewed` until the clinical content reviewer signs off; update in place when reviewed.

| ID | Location | Claim (paraphrased) | Source | Status |
|---|---|---|---|---|
| `w01-d01-intro-approach` | `program/week-01.json` w01-d01 | Sexual performance responds to structured training the way strength/endurance do | EDDIG RCT (App-based digital health application, Eur Urol Focus 2024): 12-week self-managed program, +4.5 IIEF-5 vs +0.2 control | unreviewed |
| `w01-d02-isolation-cue` | `program/week-01.json` w01-d02, and `src/features/trainer/IsolationCoachingScreen.tsx` (the same cue, free/ungated, shown once before anyone's first set) | "Stop the flow" is a valid one-time locator cue for pelvic floor muscles; should not be practiced as a regular exercise | Standard urology/physiotherapy patient-education cue (e.g. continence clinic guidance); reviewer to confirm current best-practice phrasing | unreviewed |
| `w01-d04-sleep-link` | `program/week-01.json` w01-d04 | Poor sleep is linked to lower testosterone and reduced vascular responsiveness | General sleep-endocrinology literature; reviewer to confirm citation-grade sourcing before any stronger claim is made | unreviewed |
| `w01-d05-alcohol-link` | `program/week-01.json` w01-d05 | Alcohol acutely dampens nervous-system arousal signaling, on top of longer-term vascular effects | General pharmacology; kept deliberately soft ("some men have noticed") pending reviewer sign-off on a firmer claim | unreviewed |
| `edu-how-erections-work-mechanism` | `education/how-erections-work.json` | Mechanistic description of erection physiology (corpora cavernosa, smooth muscle relaxation, venous restriction) | Standard physiology; reviewer to confirm accuracy and appropriate simplification for a lay audience | unreviewed |
| `edu-why-pelvic-floor-mechanism` | `education/why-pelvic-floor.json` | Bulbospongiosus/ischiocavernosus compress the penile base and assist venous restriction during erection | Standard pelvic anatomy; reviewer to confirm | unreviewed |
| `edu-why-pelvic-floor-hypertonic` | `education/why-pelvic-floor.json` | A subset of men have a hypertonic (over-tight) pelvic floor for whom strengthening is contraindicated and relaxation training is indicated | Pelvic floor physiotherapy literature on hypertonic pelvic floor dysfunction | unreviewed |
| `pf-hypertonic-gate` | `src/features/trainer/screen.ts` (Work item 4) | Screening questions (pelvic/perineal pain, urinary urgency/hesitancy, pain with sitting) are sufficient to route a user away from the strengthening protocol and into down-training | To be authored — **this is the single highest-priority item for reviewer sign-off**; the screening question set does not yet exist and must not ship unreviewed | unreviewed |
| `redflags-*` | `src/features/intake/redFlags.ts` (Work item 3) | The listed symptom patterns (absent morning erections + gradual onset, exertional chest symptoms, untreated cardiovascular disease/diabetes, post-surgical/traumatic onset, penile pain or new curvature, severe ED under 40) warrant a "get this checked" prompt | Drawn from standard ED differential-diagnosis red flags in urology literature; **conservative by design, reviewer to confirm the trigger set is neither over- nor under-inclusive** | unreviewed |

## Reviewer scope

The reviewer's job is these two rows and the code they point to — `pf-hypertonic-gate` and `redflags-*` — plus a pass over the sleep/alcohol/mechanism claims if time allows. Do not ask them to review copy or product decisions outside this table.
