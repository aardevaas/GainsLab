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
- **Progress** = `0.50 × cadence (logged body data this week?) + 0.50 × goalDirectionTrend` (weight/measurement trend moving the right way *for the goal*). Slow-moving; contributes to the rolling index, not daily volatility.

### 3.3 Weighting — default + goal-adjusted (v1, tunable)

| Goal | Nutrition | Training | Recovery | Consistency | Progress |
|------|:---:|:---:|:---:|:---:|:---:|
| General / Maintain | 30 | 30 | 15 | 15 | 10 |
| Lose weight | 35 | 25 | 10 | 20 | 10 |
| Gain muscle | 35 | 30 | 15 | 10 | 10 |
| Improve endurance | 20 | 35 | 20 | 15 | 10 |

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

## 10. Open questions  **[YOU / to tune]**

- [ ] Band thresholds & names — keep `Building/Consistent/Dialed-In/Elite` or rebrand?
- [ ] Is the headline a **7-day EWMA** (recoverable, smooth) or a stricter all-time/30-day index? (Recommend 7-day EWMA for v1.)
- [ ] Default weights per goal — sign off on the §3.3 table or adjust.
- [ ] Is the score **public by default** (drives community/virality) or private with opt-in sharing?
- [ ] Should creators be able to define **custom weightings** for their challenges (e.g., a "cut challenge" that weights Nutrition higher)? (Powerful, but adds complexity — v2+?)
