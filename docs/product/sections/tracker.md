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

## Target  **[YOU]**
> _What should Tracker become? This is arguably the "proof of progress" engine
> that drives retention — what makes it the most motivating tracker in the
> market?_

## Information & hierarchy  **[YOU]**
> _What's the hero metric of progress — weight, strength, photos, body comp,
> a composite "GainsLab score"? What does a user check daily vs. weekly?_

## Connections
- **Nutrition** — intake feeds calorie dashboard + weight-trend interpretation.
- **Workouts** — sessions feed the habit heatmap + streak.
- **Dashboard** — streak + key progress metrics surface here.
- **Community** — progress can be shared / drives competitions.
- **Body age / fitness tests** — periodic re-assessment as a retention hook.

## Flows
- Log a measurement → see the trend update.
- Take progress photos → compare over time (not built).
- Run the body-age assessment → track it improving.

## Open questions  **[YOU]**
- [ ] Is there a single composite "progress score" (your proprietary metric)?
- [ ] Photos: side-by-side comparison, privacy, AI body-fat estimate?
- [ ] Sleep: manual log or wearable integration (Whoop/Oura/Apple Health)?
- [ ] How do we *interpret* data for the user (coaching), not just chart it?
- [ ] Reminders/check-in cadence to keep tracking habitual?
