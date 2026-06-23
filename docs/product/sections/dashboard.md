# Section: Dashboard

> **Defined LAST, intentionally.** The Dashboard is a lens onto the sections —
> we can't choose what it surfaces until the sections are locked.

## Job
Be the home base — the one screen that tells the user where they stand today
across everything, and points them to the single most valuable next action.

## Today (live in code)
- **`/dashboard`** — greeting, 4 stat cards (daily calories, protein target,
  active streak, workouts this week), a "Today's intake" section (calorie ring
  + macro progress + remaining), a macro-targets card, and a "Quick access"
  grid that currently **mirrors the sidebar** (flagged for repurposing).

## Target  *(synthesized from the now-locked sections)*

The Dashboard answers, in one glance: **"How am I doing, what's my pod/creator
doing, and what's my single next action?"** It is a *morning check-in + all-day
hub*, not a stat museum.

**The hero is the Gains Score** — the locked composite metric — with its trend and
its `topLever` ("the #1 thing to improve today"). That one object makes the
dashboard both a status (the number) and an action (the lever). No competing
"separate dashboard score."

**The 4–5 modules a user sees instantly (each pulled from a locked section):**
1. **Gains Score** — number + trend + band + `topLever` recommendation. *(Gains Score)*
2. **Today's plan / next action** — today's scheduled workout *or* remaining macros,
   whichever is the next job → one tap to do it. *(Workouts + Nutrition)*
3. **Today's intake ring** — consumed vs. target + remaining (already built). *(Nutrition)*
4. **Streak + this-week activity** — the habit engine + activation-metric progress. *(Tracker/Consistency)*
5. **Social pulse** — your pod standing / active challenge / a notable creator post.
   *(Community)* — this is what replaces the redundant "Quick access" grid.

**The one action we drive:** complete today's `topLever` (log the meal, do the
session, take the weekly photo) — the behavior that compounds the Gains Score and
hits the 7-day activation metric.

## Resolved issues (from the audit)
- **"Quick access" grid → replaced** by the Social pulse + next-action modules
  (point of view, not a sidebar mirror).
- **Vertical density → solved** by value-dense modules (score, next action, social)
  instead of static goal cards.

## Connections
- Reads the highest-signal slice from **every** section, all via the
  `daily_metrics` spine + the social graph — never bespoke per-module queries.
- The hero (Gains Score + topLever) is the bridge to the Phase 4 AI coaching layer.

## Open questions  *(resolved)*
- #1 daily job = complete today's `topLever`; the dashboard makes it one tap. ✅
- Single headline metric = the **Gains Score**. ✅
- Use moment = morning check-in *and* all-day hub (the next-action module serves both). ✅
