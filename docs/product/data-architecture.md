# Canonical Data Architecture

> The synthesis of all nine specs into one schema + migration plan. **Design the
> schema for the whole vision; build the features incrementally** (roadmap #6).
> We add the tables we need per phase, but the *shapes and relationships* are
> decided here so nothing gets reworked. This is the load-bearing payoff of
> speccing the Gains Score first.

---

## The five layers

Everything resolves into five clean layers. Each spec's entities slot into one.

```
1. IDENTITY & SOCIAL GRAPH   profiles, follows, friendships, privacy_settings
2. ACTIVITY & METRICS        food_logs, workout_sessions/session_sets,
   (the spine ⭐)            body_measurements, sleep_logs, daily_targets,
                             daily_metrics (rollup), foods (cache)
3. CONTENT & CREATOR         creators, creator_memberships, programs, meal_plans,
                             creator_content, creator_codes, exercises(cache)
4. SOCIAL ACTIVITY           pods, pod_members, leagues, challenges,
                             challenge_entries, leaderboard_scores, feed_posts
5. MONETIZATION              plans, entitlements, plan_entitlements,
                             subscriptions, transactions, payouts, affiliate_events
```

---

## What exists today (single-player schema)

`profiles, dietary_profiles, body_measurements, food_logs, workout_plans,
workout_days, workout_exercises, workout_sessions, session_sets, progress_photos,
sleep_logs, saved_recipes, liked_dishes, grocery_lists, grocery_items,
competitions, competition_entries, leaderboard_scores, body_age_assessments,
subscriptions` — all RLS-owned by `user_id`.

Good news: the single-player core is sound. The vision is **mostly additive** —
plus a few **targeted alterations to existing tables** (below) that we must do
early or pay for later.

---

## ⭐ The non-negotiable foundations (do these right or rework everything)

### A. The `daily_metrics` rollup — the spine
One row per user per day; the canonical layer the Gains Score, streaks,
leaderboards, creator analytics, and AI **all** read (so they never disagree).
Defined in [gains-score.md §4.1](sections/gains-score.md). Computed from feature
tables on write / nightly. Everything downstream reads this, not raw tables.

### B. Snapshot targets (history must survive goal changes)
- **`daily_targets`** (user, date, calorie/protein/carb/fat targets, training
  frequency target, goal) — captured per day so a goal change next month doesn't
  rewrite the past. The Gains Score adherence math depends on this. *(Nutrition +
  Workouts specs both surfaced this.)*

### C. One social graph, not five
`follows` / `friendships` / `privacy_settings` on `profiles`. Pods, creators,
leagues, challenges all **reference** these via FKs — never re-implement identity
or relationships. *(Social Graph spec.)*

### D. Entitlement indirection
`plans → plan_entitlements → entitlements`; features check `can(user, capability)`.
Resolves all-free until activation. No feature ever checks "is paid" directly.
*(Monetization spec.)*

### E. Provider-abstraction + cache tables
`foods` and `exercises` cache tables behind `FoodProvider` / `ExerciseProvider`
interfaces — we own the data over time; swapping/adding APIs is config, not rework.

---

## Alterations to EXISTING tables (early, low-cost; expensive if deferred)

| Table | Change | Why / source spec |
|-------|--------|-------------------|
| `profiles` | + `handle` (unique), `bio`, `branding`, `is_creator`, `timezone`, privacy fields | Social Graph, Gains Score (tz) |
| `food_logs` | + full-label fields (sat/trans fat, cholesterol, sodium, fiber, sugars) + micronutrient JSON | Nutrition normalization |
| `workout_plans` | + `target_sessions_per_week`; support `created_by_creator` / published-program origin | Workouts, Creators |
| `subscriptions` | reconcile existing table with the new `plans`/`entitlements` model | Monetization |
| `competitions`/`competition_entries` | generalize into `challenges`/`challenge_entries` with custom weighting profile | Community, Gains Score #5 |

> These five alterations are the "catch it now" list. Each is cheap as an additive
> migration today and painful once millions of rows + features depend on the old shape.

---

## New tables by phase (additive — schema anticipated now, built when the phase lands)

- **Phase 1 (core):** `daily_targets`, `daily_metrics`, `foods` (cache), `exercises` (cache, + media)
- **Phase 2 (identity/social):** `follows`, `friendships`, `privacy_settings` (+ `profiles` alts)
- **Phase 3 (community):** `pods`, `pod_members`, `leagues`, `challenges`, `challenge_entries`, `feed_posts`
- **Phase 5 (creators):** `creators`, `creator_memberships`, `programs`, `meal_plans`, `creator_content`, `creator_codes`
- **Phase 6 (monetization):** `plans`, `entitlements`, `plan_entitlements`, `transactions`, `payouts`, `affiliate_events` (+ `subscriptions` reconcile)

---

## RLS model (extends the current "owner-only" pattern)

The current schema is purely `auth.uid() = user_id`. The social/creator layer needs
**graduated visibility**:
- **Own rows:** full access (unchanged).
- **Public/graph-scoped reads:** profiles, public Gains Scores, feed, leaderboards
  readable per the `privacy_settings` scope (public / followers / friends / pod /
  creators) — enforced in RLS policies, not just the UI.
- **Creator → member reads:** a creator may read a member's permitted progress
  **only** where a `creator_memberships` edge + the member's consent grant exist.
- **Write integrity:** challenge scores, payouts, entitlements are
  system/service-written, never client-written.

> Security note: the social + payment layers are where RLS gets genuinely hard.
> The **database-reviewer** and **security-reviewer** agents gate Phases 2, 3, and 6.

---

## Migration plan (sequenced, non-breaking)

1. **Now (Phase 0 → 1 boundary):** the five existing-table alterations (A/B/profiles/
   food_logs/workout_plans) + `daily_targets`, `daily_metrics`, `foods`, `exercises`.
   All additive; no destructive changes.
2. **Per later phase:** add that phase's new tables (list above) as additive migrations.
3. **`competitions → challenges` generalization:** do this *before* the community
   layer scales (cheap now; a data migration later). The existing competitions code
   is light, so the rename/generalize is low-risk today.

**Principle:** every migration is additive or a low-risk early generalization.
We never need a "rewrite the data model" migration because the shapes were decided
here, against the full vision.

---

## Open decisions  *(architecture-level — flag any)*
- [ ] `daily_metrics` **materialized table vs. nightly job vs. compute-on-read** for v1. *(Lean: nightly job + on-write update for today; cheap, simple, scales to a materialized log later.)*
- [ ] Micronutrients on `food_logs`/`foods`: **JSONB map** vs. typed columns. *(Lean: JSONB — ~80 nutrients, sparse, source-dependent.)*
- [ ] Generalize `competitions → challenges` now (recommended) or keep both temporarily? *(Lean: generalize now, while it's cheap.)*
