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

## The plan

- **[Build Roadmap](roadmap.md)** — the phased sequence from today to the
  creator-led ecosystem, with model/effort per phase and the MVP milestone.

## The order we define things

1. **[Strategic Foundation](00-strategy.md)** — the frame everything ladders up to.
   - **[Competitive Teardown](competitive-teardown.md)** — the 5 sharks, where they're beatable *(done)*.
2. **[Gains Score](sections/gains-score.md)** — specced *first* as the data-model forcing function.
3. **Main sections** (fine-grained, one at a time):
   - [Nutrition](sections/nutrition.md)
   - [Workouts](sections/workouts.md)
   - [Progress Tracker](sections/tracker.md)
   - [Community](sections/community.md)
   - [Education](sections/education.md)
   - [Supplements](sections/supplements.md)
4. **New specs the vision introduced:** Creators · Social Graph & Identity · Monetization & Tiers (model).
5. **Canonical data architecture** — from the locked specs above.
6. **[Dashboard](sections/dashboard.md)** — synthesized *last*, from the locked sections.

## Status

| Doc | State |
|-----|-------|
| Strategic Foundation | 🟢 Vision + competitive landscape complete |
| **Gains Score** | 🟢 Locked (decisions signed off; fairness math in §3.6) |
| Nutrition | 🟢 Target locked (1 fork: food-DB provider trio to confirm) |
| Workouts | 🟢 Target locked |
| Progress Tracker | 🟢 Target locked |
| Community | 🟢 Target locked (member-side; creator-side → Creators spec) |
| Education | 🟢 Target locked |
| Supplements | 🟢 Target locked |
| Creators | 🟢 Locked (the wedge) |
| Social Graph & Identity | 🟢 Locked (the social substrate) |
| Monetization & Tiers (model) | queued |
| Canonical data architecture | ⚪ After specs |
| Dashboard | ⚪ Deferred until sections are locked |

🟡 in progress · 🟢 locked · ⚪ not started
