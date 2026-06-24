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

## Target  *(synthesized from strategy + Gains Score contract + teardown — react/adjust)*

Nutrition becomes the **fast, trustworthy, "what do I eat next" engine** — beating
the incumbents on their exact weaknesses:

- **vs MyFitnessPal:** reliable data (not junk user entries) and **barcode stays
  free** (MFP paywalled it in 2024 — their backlash is our wedge). No ad clutter.
- **vs Cronometer:** the same trustworthy numbers, but *motivating and connected*
  — it tells you what to eat, not just what you ate.
- **vs Macrofactor:** adaptive macros too (v2), but inside the whole-athlete app,
  cheaper, with the community/creator layer they'll never have.

**The killer interaction (the "connected data" moat in action):**
> Log fast → see remaining macros → **"You have 48g protein and 600 kcal left —
> here are 3 meals that fit"** → tap one → it's logged and its missing ingredients
> flow to your grocery list.

This `macros → recipes → grocery` loop is the thing no competitor does, and it's
why GainsLab feels like a coach, not a spreadsheet.

**Locked decisions** (the §"Open questions" below, now resolved):
- **Daily target snapshot** — every logged day stores *that day's* calorie & macro
  targets (not recomputed from today's profile). **Hard requirement from the Gains
  Score data contract** — protects history when goals change. ⭐
- **Barcode scanning = table stakes, and free.** Critical for LatAm packaged foods.
- **Low-friction logging** = quick-add, saved meals/foods, recent/frequent, copy
  previous day, and voice/photo logging (v2). Friction is the #1 churn driver.
- **Adaptive macros (v2)** — auto-adjust targets from the weight-trend + intake the
  Gains Score already tracks. Natural differentiator once core data flows.
- **Meal planning** — creator-published plans + AI-assisted (ties to creator economy
  & the AI layer). Not manual-only.

## Information & hierarchy
1. **Hero:** today's remaining macros (the ring) + **"what fits your remaining
   macros"** suggestions. Remaining > consumed — it's the actionable number.
2. **Secondary:** quick re-log (recents/saved/scan), today's log, the week trend.
3. **Cut:** ad/upsell clutter, vanity stats with no action attached.

## Connections
- **Gains Score** — Nutrition is the heaviest pillar input: calories/protein vs the
  **daily target snapshot** feed `pillar_nutrition`. (See gains-score §4.2.)
- **Tracker** — intake feeds the calorie dashboard (intake vs TDEE) + weight-trend interpretation.
- **Dashboard** — today's intake ring is the mirrored hero.
- **Recipes → Grocery** — **yes**: logging a recipe pushes its missing ingredients
  to the grocery list (the connected loop). Locked.
- **Community / Creators** — nutrition consistency feeds streaks/leaderboards;
  creators publish meal plans that members adopt.
- **Supplements** — micronutrient gaps (Cronometer-style, enriched) can suggest supplementation.

## Flows
- Log fast (scan / quick-add / recent) → remaining macros update → meal suggestions that fit.
- Adopt a creator's or AI meal plan → day auto-populates → adjust → log.
- Browse/cook a recipe → log it → ingredients flow to grocery.

## Food data sources — LOCKED (free-first, upgrade later)

**Starting trio (all free):**
- **USDA FoodData Central** — verified whole foods + US branded → the science-backed *trust core*; "verified" badge in search.
- **Open Food Facts** — open global barcode DB → packaged goods + strong LatAm coverage; keeps barcode **free** (MFP paywalled it = our wedge).
- **FatSecret (free Basic tier)** — international (~50+ countries, Spanish/LatAm), restaurant + branded breadth. Key already in env.

**Deferred to the paid-upgrade phase:** **CalorieKing** (commercial/licensed, not
free — strong US restaurant data, revisit when we upgrade). Nutritionix / Edamam /
CalorieNinjas keys exist → kept as fallbacks only; **do not wire all six** (dedup cost).

**Architecture (so paid swaps are config, not rework):**
1. `FoodProvider` interface (`search`, `getByBarcode`, `getById`) — one adapter per API.
2. **Normalization layer** → canonical `FoodItem` capturing the **full nutrition
   label** (all fields nullable — populated when the source provides them; USDA is
   richest, OFF/FatSecret vary):
   - **Serving** — size + unit *and* weight in grams (so we can scale by either)
   - **Calories**
   - **Total Fat** → Saturated fat, Trans fat
   - **Cholesterol**
   - **Sodium**
   - **Total Carbs** → Dietary fiber, Total sugars *(+ added sugars when available)*
   - **Protein**
   - **Vitamins & micronutrients** — stored as a flexible key→amount map (USDA has
     ~80; powers future micronutrient-gap insights + the Supplements link)

   The Gains Score reads calories + protein + carbs + fat from this; the extra
   fields give us **Cronometer-grade depth for free**, feeding a future
   nutrition-quality signal and the supplement-gap recommender.
3. **Search orchestration** — barcode: Open Food Facts → USDA; text: FatSecret + USDA merged & deduped, USDA badged **"verified."**
4. **Local cache (`foods` table)** — cache every fetched item → beat free-tier rate limits *and* grow a proprietary food DB asset over time.
