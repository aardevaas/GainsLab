# Section: Progress Tracker

> Covers: Body measurements, weight trend, habit calendar, progress photos,
> sleep log, calorie dashboard, body age score.

## Job
Show the user that the work is paying off — turning scattered effort into
visible, motivating proof of progress over time.

## Today (live in code)
- **`/tracker`** — stat cards (current weight, body fat, activity streak),
  30-day weight chart (Recharts), and a nav grid to sub-tools. Full-width
  layout (chart + sidebar).
- **`/tracker/body`** — log weight, body fat %, measurements.
- **`/tracker/habits`** — 90-day activity heatmap (GitHub-style).
- **`/tracker/calories`** — 30-day calorie intake vs TDEE + weight projection.
- **`/profile/body-age`** — 5-test fitness assessment (pushups, situps, resting
  HR, flexibility, mile time) → body age vs chronological age.
- **`/tracker/photos`** — stub (ComingSoon).
- **`/tracker/sleep`** — stub (ComingSoon).

## Target  *(synthesized — react/adjust)*

Tracker is the **proof-of-progress engine** — the retention core. People quit
fitness apps when effort feels invisible; Tracker's job is to make progress
*undeniable and motivating*, and to **interpret** it, not just chart it.

- **The hero is the Gains Score** (the composite proprietary metric — that question
  is answered: it's the Gains Score, specced separately). Tracker is where its
  trend + pillar breakdown live in depth, alongside the raw signals (weight, body
  comp, strength, photos, sleep).
- **vs Whoop/Oura:** no hardware required — we infer recovery/progress from logged
  data, and *integrate* wearables when present rather than gate behind a device.
- **The edge is interpretation (coaching), not charts.** Every view answers "what
  does this mean and what do I do?" — fed by the Gains Score `topLever` and the
  Phase 4 AI layer. Charts that just sit there are the failure mode we avoid.

**Locked decisions** (resolving the open questions):
- **Composite progress metric = the Gains Score.** No separate competing metric.
- **Progress photos = build it** (currently stubbed): private-by-default, secure
  storage, **side-by-side / timeline comparison**, optional share to community.
  AI body-fat-from-photo estimate = later (v3, opt-in).
- **Sleep:** manual log **first** (unblocks the Recovery pillar), **wearable
  integration after** (Apple Health / Google Fit / Whoop / Oura) — abstraction so
  manual and device feed the same `sleep` signal.
- **Interpretation everywhere:** each metric pairs with a plain-language read
  ("weight up 0.4kg but that tracks your surplus — on plan"). Seeds from Gains
  Score, deepens with AI.
- **Habit cadence:** smart reminders/check-ins (weigh-in, weekly photo, measurement)
  tuned to drive the activation metric (7-day streak). Tie into notifications.

## Information & hierarchy
1. **Hero:** the **Gains Score** + trend (the headline proof), with its pillar breakdown.
2. **Body composition:** weight + body-fat trend (smoothed), measurements, photo timeline.
3. **Strength/volume progression** (from Workouts), habit heatmap, sleep/recovery.
4. **Daily check:** Gains Score + streak. **Weekly check:** body comp, photos, measurements.

## Connections
- **Gains Score** — Tracker is its home for depth; body data feeds the Progress
  pillar (with the §3.6 fairness normalization — bodyweight-relative, body-comp-aware).
- **Nutrition** — intake feeds the calorie dashboard + weight-trend interpretation.
- **Workouts** — sessions feed the habit heatmap, streak, strength progression.
- **Dashboard** — Gains Score + streak + standout metric surface here.
- **Community/Creators** — progress (photos, score, transformations) shareable; drives challenges + Reels.
- **Body Age** — periodic capability re-assessment; complements the daily Gains Score.

## Flows
- Log a measurement/weight → smoothed trend + interpretation update → Gains Score Progress pillar updates.
- Capture a progress photo → timeline + side-by-side comparison → optional share.
- Weekly check-in (reminder) → log body data → see the week's verdict.

## Open questions  *(resolved above; nothing blocking)*
- Wearable integrations are sequenced after manual sleep; specific SDKs chosen at that phase.
