# Section: Supplements

> Covers: Supplement Advisor.

## Job
Cut through supplement-industry noise — tell the user what actually works for
*their* goal, what to skip, and how to dose it, backed by evidence grades.

## Today (live in code)
- **`/supplements`** — advisor: 13 supplements with evidence grades (A–D),
  dosage, timing, mechanism, notes; filter by goal and by minimum evidence.
- Static data in `src/lib/supplements/data.ts`.
- Honest grading (e.g. BCAAs graded D as redundant when protein is adequate).

## Target  *(synthesized — react/adjust)*

Supplements is **both a trust feature and a monetization lever** — and the trust
*is* what makes the monetization work.

- **Trust hero = honesty (what NOT to take).** The evidence grades (A–D, BCAAs
  graded D) are the differentiator — we tell people what to skip. That honesty is
  what makes a recommendation believable enough to buy through.
- **Personalized stack recommender**, not just a catalog: keyed to the user's
  **goal + diet + actual nutrition gaps** (from the full-label micronutrient data
  we now capture). "Your logged intake is low on magnesium and you're cutting —
  here's the evidence-graded option."
- **Monetization (strategy revenue stream 3):** affiliate in mature markets;
  **local store partnerships / promo codes** in LatAm; **creators get their own
  codes/partnerships** (a creator perk they'll love). Behind the abstraction so
  the link/commerce layer is swappable per region.

## Information & hierarchy
- **Hero:** the personalized stack for *your* goal + gaps, each item evidence-graded.
- **Secondary:** searchable catalog by goal/evidence; "skip these" honesty section.

## Connections
- **Nutrition** — the micronutrient map flags real intake gaps → targeted suggestions.
- **Gains Score / Profile** — recommendations keyed to goal + the user's data.
- **Education** — shares the evidence-grade trust model.
- **Monetization** — affiliate / local partnerships / creator codes (region-abstracted).

## Open questions  *(resolved; nothing blocking)*
- Affiliate/partnership providers per region are a Monetization-phase ops decision;
  the data/recommender model is set.
