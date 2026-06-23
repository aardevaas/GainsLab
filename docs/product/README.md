# GainsLab — Product Definition

This directory is the **source of truth** for what GainsLab is and what every
section does. Design and engineering work execute against these specs — not the
other way around. If a spec and the code disagree, the spec wins and the code
is wrong.

## Why this exists

We paused design/polish (Phase C/D) to lock the product first. Polishing a
surface we're about to redefine is wasted work. These docs capture the vision
*before* we pour effort into making it beautiful.

## How to read a spec

Each section spec has the same shape:

| Field | Meaning |
|-------|---------|
| **Job** | What this section is *for* — the user goal it serves |
| **Today** | What exists right now (filled from the live code) |
| **Target** | The vision — what it *should* become *(you fill this)* |
| **Information & hierarchy** | What's shown, and what matters most |
| **Connections** | How it feeds / depends on other sections |
| **Flows** | The key actions a user takes here |
| **Open questions** | Gaps to resolve before we build |

`Today` is written by Claude from the code. `Target` and the answers to
`Open questions` come from you — that's the vision we're capturing.

## The order we define things

1. **[Strategic Foundation](00-strategy.md)** — the frame everything ladders up to.
   - **[Competitive Teardown](competitive-teardown.md)** — the 5 sharks, where they're beatable *(done)*.
2. **Main sections** (fine-grained, one at a time):
   - [Nutrition](sections/nutrition.md)
   - [Workouts](sections/workouts.md)
   - [Progress Tracker](sections/tracker.md)
   - [Community](sections/community.md)
   - [Education](sections/education.md)
   - [Supplements](sections/supplements.md)
3. **[Dashboard](sections/dashboard.md)** — synthesized *last*, from the locked sections.

## Status

| Doc | State |
|-----|-------|
| Strategic Foundation | 🟡 Competitive landscape done; vision sections awaiting you |
| Nutrition | 🟡 Today filled — awaiting Target |
| Workouts | 🟡 Today filled — awaiting Target |
| Progress Tracker | 🟡 Today filled — awaiting Target |
| Community | 🟡 Today filled — awaiting Target |
| Education | 🟡 Today filled — awaiting Target |
| Supplements | 🟡 Today filled — awaiting Target |
| Dashboard | ⚪ Deferred until sections are locked |

🟡 in progress · 🟢 locked · ⚪ not started
