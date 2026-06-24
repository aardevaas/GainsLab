# Spec: The Gains Score (Transformation Index)

> **Phase 0, Step 1 — the forcing function.** This is designed *first* and built
> *last(ish)*. Its purpose right now is to dictate exactly what data every
> feature must capture, so the data model comes out right the first time. The
> numbers here (weights, bands, tolerances) are **v1 defaults — tunable**; the
> *structure* and the *data contract* are what we're locking.

---

## 1. Purpose

One number, 0–100, that answers: **"Am I executing my transformation well?"**
It is the heartbeat of GainsLab — the thing a user checks daily, a creator's
community competes on, leaderboards rank by, the AI explains, and Reels show off.

It must be:
- **Actionable** — always paired with "the one thing to improve it."
- **Controllable** — driven by behavior the user owns, not genetics or starting point.
- **Fair & recoverable** — a bad day dents it, doesn't destroy it.
- **Honest** — reflects real work; resistant to gaming.
- **Personal** — relative to *the user's* goal and *their* targets, never absolute.

---

## 2. Core principle: process drives it, outcomes validate it

Scoring on **outcomes** (kg lost) is demotivating and unfair — results lag, water
weight lies, genetics differ, plateaus happen. Scoring on **process** (did you do
the work) is controllable, daily, and predictive of results.

> **The daily score is ~85% process (execution) + ~15% outcome (trend toward
> goal).** Process is the engine; the outcome modifier keeps process honest
> (you can't "log perfectly" forever while the trend goes nowhere without the
> score noticing).

---

## 3. The model

### 3.1 Five pillars (each scored 0–100 per day)

| Pillar | Measures | Primary source feature |
|--------|----------|------------------------|
| **Nutrition** | Logged + hit calorie & protein targets (within tolerance) | Nutrition / food_logs |
| **Training** | Trained at your goal's frequency; volume/progression trending up | Workouts / workout_sessions + session_sets |
| **Recovery** | Sleep duration & consistency; rest-day balance; HRV *(enriched)* | Tracker / sleep_logs *(+ wearables later)* |
| **Consistency** | Showed up — logging completeness & streak across pillars | Derived (all sources) |
| **Progress** | Logged body data on cadence; trend moving toward the goal | Tracker / body_measurements, progress_photos |

### 3.2 How each daily pillar sub-score is computed (v1 logic)

- **Nutrition** = `0.50 × calorieAdherence + 0.35 × proteinAdherence + 0.15 × loggingCompleteness`
  - *calorieAdherence*: 100 within ±5% of the day's calorie target, decaying linearly to 0 at ±30%. (Goal-aware: for `lose_weight`, being *under* is fine — only penalize overshoot; for `gain_muscle`, penalize undershoot.)
  - *proteinAdherence*: `min(100, protein_logged / protein_target × 100)` (hitting protein is rarely "too much").
  - *loggingCompleteness*: did the day have a credible log (≥ a minimum kcal + ≥1 real entry), guarding against blank/junk days.
- **Training** = `0.60 × weeklyPace + 0.25 × sessionQuality + 0.15 × progressionTrend`
  - *weeklyPace*: rolling sessions-this-week ÷ goal target frequency (capped at 100; rest days per plan never penalize).
  - *sessionQuality*: a logged session with real sets/reps/load vs. an empty check-in.
  - *progressionTrend*: volume or estimated-1RM trending up over trailing weeks (bonus, floored so beginners/deloads aren't punished).
- **Recovery** *(enriched — see phasing)* = sleep duration vs. 7–9h target + sleep consistency + rest-day balance (+ HRV when a wearable is connected).
- **Consistency** = streak strength × logging completeness across the day's relevant pillars. This is the habit engine; it ties directly to the activation metric.
- **Progress** = `0.40 × cadence (logged body data this week?) + 0.60 × fairTrend`, where `fairTrend` is the **starting-point-normalized** outcome score defined in §3.6 (this is the "fair to the skinny gainer *and* the obese loser" math). Slow-moving; contributes to the rolling index, not daily volatility.

### 3.3 Weighting — default + goal-adjusted (v1, tunable)

| Goal | Nutrition | Training | Recovery | Consistency | Progress |
|------|:---:|:---:|:---:|:---:|:---:|
| General / Maintain | 30 | 30 | 15 | 15 | 10 |
| Lose weight | 35 | 25 | 10 | 20 | 10 |
| Gain muscle | 35 | 30 | 15 | 10 | 10 |
| Improve endurance | 20 | 35 | 20 | 15 | 10 |

### 3.6 Fairness mathematics — starting-point & difficulty normalization  ⭐

> **Decision (locked):** the outcome/Progress component must be *incredibly fair*
> across body types — a lean person fighting for slow muscle gain and an obese
> person losing faster should both be able to score 100 when each executes
> optimally **for their own body.** Absolute change (kg/week) is unfair; we
> normalize for size, goal difficulty, and proximity to goal.

**Step 1 — Bodyweight-relative rate (fair across body size).**
Convert absolute change to **% of bodyweight per week** over a smoothed trailing
window (≥14 days to filter water-weight noise):
```
r = (Δweight_kg / weight_kg) / weeks      // e.g. −0.83%/wk
```
A 120 kg person losing 1 kg/wk and a 60 kg person losing 0.5 kg/wk both = −0.83%/wk →
**identical fairness input.** Size no longer advantages anyone.

**Step 2 — Personalized optimal-rate target `r*` and tolerance `σ`.**
The *healthy, muscle-sparing* optimal rate depends on goal **and** the user's body
fat (more fat reserves → faster loss is safe & optimal; leaner → slower):

| Goal | `r*` (%/wk) | `σ` (tolerance) | Difficulty note |
|------|:---:|:---:|---|
| Lose weight, higher body fat | −1.0 | 0.45 | More reserves → faster loss is safe; wide band |
| Lose weight, lean | −0.5 | 0.30 | Must go slower to spare muscle; narrow band |
| Gain muscle, novice | +0.50 | 0.35 | "Newbie gains" allow faster |
| Gain muscle, trained | +0.25 | 0.20 | Muscle gain is intrinsically slow → small `r*`, tight band |
| Maintain / recomp | 0.00 | 0.30 | Scored on body-comp trend, not the scale |

`r*` and `σ` interpolate continuously from body-fat % and training age — no hard cliffs.

**Step 3 — Gaussian scoring around the optimal (rewards *right*, not *more*).**
```
rateScore = 100 × exp( −(r − r*)² / (2σ²) )
```
Hitting `r*` = 100. **Too fast is penalized as much as too slow** — overshooting
(crash-dieting → muscle loss; dirty-bulking → fat gain) is *not* rewarded. Because
`r*`/`σ` are personalized, the lean gainer and the obese loser both peak at 100
when each does what's optimal *for them*. This is the core fairness guarantee.

**Step 4 — Body-composition override (fairer than the scale).**
When body-fat %/measurements exist, compute the trend on **body composition**, not
scale weight. This correctly rewards **recomposition** (weight flat, fat ↓, lean ↑ =
excellent) and ignores water-weight lies. Signal priority: body-fat/measurement
trend → scale-weight trend → cadence-only.

**Step 5 — Proximity-to-goal blend (don't punish the near-finished).**
As a user nears their goal, healthy change *should* slow. Blend in a **maintenance/
adherence** score weighted by proximity, so someone at goal who holds steady scores
high instead of being stuck at a low "no progress" number:
```
fairTrend = (1 − p) × rateScore + p × maintenanceScore
p = proximity to goal (0 far → 1 at goal)
```

**Net effect:** the score is always measured against *your* optimal path, scaled to
*your* body, with *your* difficulty — never an absolute leaderboard of biology.
Two people executing perfectly score the same regardless of where they started.

### 3.4 Graceful degradation (critical for early users)

If a pillar has **no data source yet** (e.g., Recovery before sleep tracking ships,
or Progress before the user logs a measurement), its weight is **dropped and the
remaining weights renormalized to sum to 100.** A v1 user is fairly scored on
Nutrition + Training + Consistency + (Progress once they log) — never penalized
for features that don't exist or data they haven't entered yet.

### 3.5 Aggregation

- **Daily Score** = weighted sum of available daily pillar sub-scores (using the user's local day).
- **Gains Score (the headline)** = a **7-day exponentially-weighted moving average** of daily scores (recent days weighted more; smooth, recoverable, reflects sustained behavior, not one perfect/terrible day). Half-life ≈ 3 days (tunable).
- **Trend** = current Gains Score − the value 7 days ago.
- **Bands** (qualitative label, tunable): `0–39 Building · 40–64 Consistent · 65–84 Dialed-In · 85–100 Elite`.

---

## 4. The data contract  ⭐ (this is why we spec it first)

Every consumer — Gains Score, streaks, leaderboards, creator analytics, AI recs —
must read from **one consistent layer**, or they'll disagree with each other.

### 4.1 Architectural recommendation: a `daily_metrics` rollup

Introduce a per-user-per-day canonical rollup — the **spine** every consumer reads:

```
daily_metrics
  user_id, date (user-local)
  -- raw inputs captured that day --
  calories_in, protein_g, carbs_g, fat_g, calorie_target, protein_target
  trained (bool), session_count_week, training_volume, est_1rm_snapshot
  sleep_minutes, sleep_quality            -- nullable until Recovery ships
  logged_food (bool), logged_workout (bool), logged_progress (bool)
  weight_kg, body_fat_pct                  -- nullable; carried-forward trend
  -- computed --
  pillar_nutrition, pillar_training, pillar_recovery, pillar_consistency, pillar_progress  -- 0..100, nullable if unavailable
  daily_score, gains_score                 -- gains_score = EWMA
  goal_snapshot                            -- the goal used for weighting that day
  computed_at
```

- **v1:** `daily_metrics` is computed from the existing feature tables (food_logs,
  workout_sessions, session_sets, body_measurements) on write or via a nightly job.
- **Later:** if scale demands, back it with a materialized `activity_events` log —
  but because the *source shapes* are correct from day one, that's an additive
  change, **not a rework.**

### 4.2 What each feature MUST capture (the Phase 1 build requirement)

| Pillar | Required signals | Status in current schema |
|--------|------------------|--------------------------|
| Nutrition | per-entry `calories, protein_g, carbs_g, fat_g, date, user_id` **+ the day's calorie & protein targets** | logs ✅; **must snapshot/derive daily targets** ⚠️ |
| Training | `workout_sessions(date, completed, duration)` + `session_sets(reps, weight_kg, exercise_id)` **+ user's goal target frequency** | sessions/sets ✅; **target frequency** needs a home ⚠️ |
| Recovery | `sleep_logs(date, minutes, quality)` (+ wearable HRV later) | table exists, **unbuilt** ⚪ |
| Consistency | presence of logs per day (derivable) + streak | derivable ✅ |
| Progress | `body_measurements(date, weight_kg, body_fat_pct)`, `progress_photos(date)` | measurements ✅; photos **stubbed** ⚪ |

> **The two ⚠️ items are the spec's most important output:** Phase 1 must give
> *daily macro targets* and *goal training frequency* a durable home (a daily
> target snapshot, so a target change next month doesn't rewrite history). Catch
> this now = no rework later.

---

## 5. Presentation contract (what the score object returns)

So Dashboard, Community, Reels, and AI all consume it identically:

```ts
type GainsScore = {
  score: number;            // 0–100 headline (7-day EWMA)
  daily: number;            // today's score
  trend: number;            // Δ vs 7 days ago
  band: 'building' | 'consistent' | 'dialed-in' | 'elite';
  pillars: Record<Pillar, { score: number | null; weight: number; available: boolean }>;
  topLever: { pillar: Pillar; message: string };  // the #1 improvement opportunity
  dataCompleteness: number; // 0–1, how many pillars have data (drives "keep building your score")
  computedAt: string;
};
```

`topLever` (lowest weighted contribution among available pillars) is **mandatory** —
it's what makes the score actionable and is the hook the Phase 4 AI layer expands
into real coaching.

---

## 6. Phasing (design now, build incrementally)

| Stage | Pillars active | When |
|-------|----------------|------|
| **v1 (thin)** | Nutrition, Training, Consistency, (Progress once logged) | As soon as Phase 1 core data flows |
| **v2** | + Recovery (sleep log built) | After Tracker sleep ships |
| **v3 (enriched)** | + wearable HRV/recovery, richer progression & outcome modeling, AI-tuned weights | Phase 4 intelligence layer |

---

## 7. Edge cases & anti-gaming

- **New user / insufficient data:** show "Building your score — N more days of data" until ≥3 scored days; never show a misleading low number.
- **Rest days:** never penalize a planned rest day; Training uses weekly pace, not daily presence.
- **Timezones:** all "days" are the user's local day (store tz on profile).
- **Gaming guards:** require *credible* data (kcal ≥ floor + real entries; sessions with actual sets); diminishing returns on over-logging; protein can't exceed 100; can't farm Nutrition with a 50-kcal day.
- **Missing data ≠ zero:** unavailable pillars are dropped (renormalize), not scored 0.

---

## 8. What the Gains Score is NOT

- Not a medical/health diagnosis.
- Not the **Body Age** fitness assessment (that's a separate, periodic test — they
  complement each other: Body Age = capability snapshot; Gains Score = daily execution).
- Not an absolute ranking of "fitness" — two people with identical scores can be at
  very different fitness levels; it measures *execution against one's own plan*.

---

## 9. Connections

- **Every main feature** is an input (the contract above).
- **Dashboard** — the Gains Score is the headline hero metric (defined in the Dashboard spec, last).
- **Community** — leaderboards/pods/leagues can rank by Gains Score or its pillars; creators compete their communities on it.
- **AI / Phase 4** — `topLever` is the seed for real coaching recommendations.
- **Virality** — Reels showcase score + trend.
- **Monetization** — depth of history/insights can be a premium tier (entitlement model, P0).

---

## 10. Decisions (locked)

1. ✅ **Headline = 7-day EWMA** (smooth, recoverable).
2. ✅ **Goal-weight table kept**, plus the **§3.6 fairness mathematics** — the
   outcome score is normalized for body size, body-fat, goal difficulty, and
   proximity to goal, so the lean gainer and the obese loser both peak at 100
   when executing optimally for their own body.
3. ✅ **Public by default**, with a per-user **private toggle** (and granular
   share controls feed the Social Graph + privacy spec next).
4. ✅ **Bands kept** — `Building / Consistent / Dialed-In / Elite` — doubling as
   community tiers/badges; brandable later.
5. ✅ **Creators can fully customize challenge weightings** (creators are core).
   Per-challenge weight overrides are a first-class concept, not v2 — the
   Community/Creator specs must support a challenge-scoped weighting profile.

*All numbers (weights, `r*`, `σ`, band thresholds, EWMA half-life) remain
runtime-tunable constants — locked structure, adjustable values.*
