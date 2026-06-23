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

## Target  **[YOU — deferred]**
> _To be synthesized once the main sections are locked. The question we'll
> answer then: of everything the sections track, what are the 3–5 things a user
> must see the instant they open the app — and what's the one action we want
> them to take?_

## Known issues to resolve here (from the audit)
- "Quick access" duplicates the sidebar — it should become something with a
  point of view (today's plan, next action, recent activity, standout metric).
- Vertical density: needs value-dense modules, not just goals.

## Connections
- Pulls the highest-signal slice from **every** section. This doc gets written
  by reading the locked Target of each section spec.

## Open questions  **[deferred until sections locked]**
- [ ] What is the user's #1 daily job, and does the dashboard make it one tap away?
- [ ] Is there a single "GainsLab score" that headlines the dashboard?
- [ ] Morning check-in vs. all-day hub — what's the primary use moment?
