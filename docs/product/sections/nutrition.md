# Section: Nutrition

> Covers: Nutrition hub, food logging, recipes, grocery list, macro analysis.

## Job
Help the user hit their daily macro/calorie targets and plan what to eat —
turning "what should I eat today" into a solved, low-friction loop.

## Today (live in code)
- **`/nutrition`** — hub: today's calorie ring (consumed vs goal), per-macro
  % (protein/carbs/fat), a 7-day calorie bar chart, and quick cards (Today's
  log, Recipes, Grocery, Macro targets). Full-width 2-column layout.
- **`/nutrition/log`** — food logging against a date.
- **Food data** sourced from multiple APIs available in env (USDA, Nutritionix,
  FatSecret, Edamam, CalorieNinjas, Spoonacular) — integration depth varies.
- **`/recipes`** — TheMealDB browser: search, categories, random featured,
  recipe detail, saved recipes.
- **`/grocery`** — grocery list (optimistic add/remove).
- **`/profile/macros`** — full TDEE + macro target analysis (Mifflin-St Jeor /
  Harris-Benedict / Katch-McArdle), cutting/maintain/bulking.
- Macro goals computed from profile stats; falls back to defaults if profile
  incomplete.

## Target  **[YOU]**
> _What should Nutrition become? How does it beat MyFitnessPal/Cronometer/
> Macrofactor? What's the killer interaction?_

## Information & hierarchy  **[YOU]**
> _On the Nutrition hub, what is the #1 thing a user must see? What's secondary?
> What's noise we should cut?_

## Connections
- **Tracker** — calorie intake feeds the calorie dashboard (intake vs TDEE) and
  weight trend interpretation.
- **Dashboard** — today's intake ring is mirrored on the dashboard.
- **Community** — nutrition consistency feeds streaks/leaderboard.
- **Recipes → Grocery** — should a recipe push ingredients to the grocery list?
- **Supplements** — overlaps with micronutrient gaps?

## Flows
- Log a food → see remaining macros update.
- Plan a day/week of meals.
- Browse a recipe → cook → log it / add to grocery.

## Open questions  **[YOU]**
- [ ] Which food database is the source of truth? (We have 6 API keys — pick.)
- [ ] Barcode scanning — table stakes or later?
- [ ] Adaptive macros (Macrofactor-style auto-adjust from weight trend) — in?
- [ ] Meal planning: manual, template-based, or AI-generated?
- [ ] Custom foods / saved meals / quick-add — how deep?
