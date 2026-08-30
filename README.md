# Foundation

A private, self-directed men's health app. Foundation is a structured, 12-week training
program for sexual performance and confidence — pelvic floor work, movement, sleep, alcohol,
and easing performance pressure. Everything in it is something a man does himself: no
medication, no consultations, no one else involved unless he chooses to back up his progress.

Built with React Native (Expo) for iOS and Android.

## Why this app

Sexual performance responds to structured training the same way strength or endurance does.
Most products in this space are either a medication subscription or a scattered bundle of
Kegel timers and generic meditations. Foundation is neither — it's one coherent program,
grounded in published research on pelvic floor training, movement, sleep, and performance
anxiety, delivered as a private, on-device experience with nothing to sign up for on day one.

## What's in the app

- **Onboarding** — a short intake, a plain "worth getting checked" screen when a symptom
  pattern warrants it (never a label, never a referral), and a baseline self-assessment.
- **A 12-week program** — daily 5–10 minute sessions combining pelvic floor training, guided
  breathing, movement and lifestyle prompts, and short reflections. Weeks 1–4 are fully
  written; the rest of the program is present as a visible, titled roadmap.
- **A free pelvic floor trainer** — available with no account and no program commitment,
  including guidance on finding the right muscle before any timed work starts, and a
  screening step for men whose pelvic floor needs relaxation training rather than
  strengthening.
- **Progress tracking** — a repeatable self-assessment (every 4 weeks, on purpose — not more
  often) with a trend chart, streaks, and session history.
- **Local-first data** — everything lives on the device by default. Backing up progress is
  opt-in, from Settings, never required to use the app.

## Explicitly out of scope

By design, not by omission: no medication content beyond neutral education, no supplements,
no telehealth, no clinician booking or referral, and no revenue from any of the above.

## Naming

The product name is currently **Foundation** — a deliberate placeholder chosen for its
discretion (a name that reveals nothing on a home screen or lock screen) while a final name
is decided. It's isolated in one file — `src/constants/brand.ts` — so a rename later is a
small, contained change, not a search-and-replace across the app.

## Tech stack

- **Expo SDK 57** (React Native 0.86, React 19), **expo-router** for file-based navigation
- **expo-sqlite** as the only source of truth — no state lives solely in memory
- **react-native-reanimated 4** for the pelvic floor trainer's timing ring
- Purchases and backup sync are both built behind provider interfaces with mock
  implementations, so the whole app runs in Expo Go with zero third-party accounts
- **Jest** (`jest-expo`) for unit tests on every pure decision (program routing, the
  screening logic, scoring, streaks, trainer progression)

## Getting started

```bash
npm install
npm start
```

This opens the Expo dev server. Scan the QR code with **Expo Go** on a physical device.

> **A note on Expo Go compatibility:** this project runs on Expo SDK 57. The App Store and
> Play Store versions of Expo Go can lag behind the newest SDKs — if you see "Project is
> incompatible with this version of Expo Go," get a matching build from
> [expo.dev/go](https://expo.dev/go) (Android) or [sign.expo.dev](https://sign.expo.dev)
> (iOS, via free Apple ID provisioning — the install expires after about a week and needs
> re-signing) rather than reinstalling from the store.

### Running tests

```bash
npm test
```

### Type checking

```bash
npx tsc --noEmit
```

## Project structure

```
app/                    # expo-router routes only
  (onboarding)/          # welcome, intake, screening, self-assessment
  (app)/                 # the main tab set: Today, Progress, Trainer, Learn, Settings
  session/[id].tsx        # the daily session player
  trainer/run.tsx         # the standalone pelvic floor trainer
  paywall.tsx
src/
  db/                    # SQLite schema, migrations, one query module per entity
  content/                # the 12-week program and education pieces, as versioned JSON
  features/               # intake logic, assessment scoring, trainer, session, paywall, sync…
  ui/                     # design tokens and shared components
content-authoring/
  CLAIMS.md               # every factual claim in the app's content, with its source,
                           # awaiting sign-off from a clinical reviewer before launch
```

## Content and claims

Every claim in the app's copy that isn't obviously common knowledge is marked `[CLAIM]` in
the source and listed in [`content-authoring/CLAIMS.md`](./content-authoring/CLAIMS.md) with
its source. Two items there carry real safety weight and are the ones that need an actual
clinical reviewer's attention before shipping: the pelvic floor training progression, and the
"worth getting checked" screening logic.

## Privacy

By default, nothing leaves the device — no account is required to use the app. Backup is
opt-in and off until a user turns it on in Settings. See `app/(app)/settings/privacy.tsx` for
the in-app copy.

## Status

This is an MVP in active development. As of now, weeks 5–12 of the program are structural
placeholders, and on-device manual verification is still outstanding.
