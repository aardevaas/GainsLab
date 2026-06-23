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

## Target  *(synthesized — react/adjust)*

Workouts must be **as good to log in as Hevy** (non-negotiable — it's the price of
entry; creators won't bring audiences to a worse logger) **plus** the two things
Hevy/Fitbod/Strong structurally can't do:

- **vs Hevy/Strong:** match the beloved logging UX, then add the layers they lack —
  nutrition-aware recovery, the whole-athlete picture, and creators.
- **vs Fitbod:** progression intelligence too — but **informed by the connected
  data Fitbod can't see** (your nutrition + sleep + recovery), so the
  recommendation is *"you under-ate and slept 5h — hold weight today,"* not a
  blind muscle-recovery guess.

**The wedge is the creator linchpin in training:**
> Creators publish **programs/routines** their community adopts in one tap — the
> member's plan, sessions, and progression all live in GainsLab. This is the
> training half of the creator economy; the plan builder must be **dual-mode:
> personal *and* creator-authored-and-published.**

**Locked decisions** (resolving the open questions):
- **Logging parity with Hevy** = table stakes: rest timers, supersets/circuits, RPE/RIR, PRs, per-exercise history, plate math. Build to match, then exceed.
- **Goal training frequency gets a durable home.** ⭐ Hard requirement from the
  Gains Score contract (the Training pillar's `weeklyPace` needs the target). Lives
  on the plan (sessions/week) and/or profile — snapshot like the nutrition target.
- **Progression intelligence: v1 tracks volume + estimated 1RM per lift; v2 suggests
  next load/reps**, enriched by nutrition/recovery (the connected-data edge).
- **Exercise media = yes** (the landing promised animated diagrams/demos) — sourced
  from a free exercise dataset (e.g. the open **wger** / Free Exercise DB) + our own;
  same provider-abstraction + cache pattern as the food DB.
- **Pre-built templated programs** (PPL, 5/3/1, Starting Strength, etc.) ship as
  first-party content *and* seed the creator-program format.

## Information & hierarchy
1. **Hero (returning user):** "**Start today's session**" — the plan knows what's
   scheduled; one tap into the live logger. The primary job is *train*, not *manage*.
2. **Secondary:** this week's training pace vs. goal (feeds Gains Score), active plan, recent PRs.
3. **Manage plans / browse programs / exercise library** = one level down.

## Connections
- **Gains Score** — sessions + `session_sets` (reps/weight) + **goal frequency** feed
  `pillar_training` (weeklyPace, sessionQuality, progressionTrend). See gains-score §4.2.
- **Tracker** — sessions feed the habit heatmap, streak, and volume/e1RM progression charts.
- **Dashboard** — "workouts this week" + next session surface here.
- **Community / Creators** — workout activity feeds leaderboards/challenges; **creators
  publish programs members adopt** (core monetization surface).
- **Nutrition + Recovery** — training load informs calorie/recovery guidance and the
  progression engine (the moat Fitbod can't match).
- **Exercises** — the library (with media) feeds the builder.

## Flows
- Open Workouts → "Start today's session" → log sets live (rest timer, PRs) → finish → streak + Gains Score update.
- Adopt a creator's published program → it becomes your scheduled plan.
- Build/edit a personal plan → schedule days → add exercises from the library.
- (Creator) author a program → publish to your community.

## Open questions  *(resolved above; nothing blocking)*
- Exercise media/content provider to confirm at Phase 1 build (free dataset + our own), same pattern as food DB.
