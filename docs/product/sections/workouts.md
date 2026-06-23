# Section: Workouts

> Covers: Workout plans, plan builder, exercise library, live session logging.

## Job
Help the user build a training plan and execute it — turning "what do I train
today and did I progress" into a guided, tracked loop.

## Today (live in code)
- **`/workouts`** — list of the user's plans (2-col grid) or a centered empty
  state ("No workout plans yet" + Create plan).
- **`/workouts/create`** — plan builder.
- **`/workouts/[id]`** — plan detail / edit (days, exercises, sets/reps).
- **`/workouts/log`** — live session logger (sets, reps, weight per exercise);
  completing a session writes `workout_sessions` + `session_sets` and updates
  any joined workout-type competitions.
- **`/exercises`** — exercise library (search/browse; "800+ exercises" claimed).
- Plans have difficulty, goal, days/week metadata.

## Target  **[YOU]**
> _What should Workouts become? How does it beat Hevy/Strong/Fitbod? Is the
> edge in the building, the logging, the progression intelligence, or the
> integration with nutrition/recovery?_

## Information & hierarchy  **[YOU]**
> _When a user opens Workouts, what's the primary action — start today's session,
> or manage plans? What does a logged-in returning user see first?_

## Connections
- **Tracker** — sessions feed the habit heatmap, streak, and (future) volume/
  strength progression charts.
- **Dashboard** — "workouts this week" stat.
- **Community** — workout count feeds leaderboard + competitions.
- **Exercises** — the library feeds the plan builder.
- **Nutrition/Recovery** — does training load adjust calorie/recovery guidance?

## Flows
- Create a plan → schedule days → add exercises.
- Start a session → log sets live → finish → see it reflected in streak.
- Browse an exercise → add to a plan.

## Open questions  **[YOU]**
- [ ] Progressive overload intelligence — does the app suggest next weights/reps?
- [ ] Exercise media — animated diagrams / video demos? (landing promises this)
- [ ] Rest timers, supersets, RPE/RIR tracking — in scope?
- [ ] Pre-built / templated programs (PPL, 5/3/1, etc.) vs. only custom?
- [ ] Strength progression analytics (e1RM trends per lift) — how deep?
