# GainsLab — Build Roadmap

> The sequenced plan from where we are today to the creator-led transformation
> ecosystem in [00-strategy.md](00-strategy.md). Built to be executed **bit by
> bit** — each phase ships standalone value and sets up the next.

---

## The reframe (read this first)

The strategy brain-dump changed what we're building. We are **no longer**
shipping an all-in-one single-player fitness tracker. We're building a
**three-sided creator-led transformation platform**:

- **Members** transform (train + eat + measure + learn + compete)
- **Creators** bring their audiences and monetize
- **Brands** sponsor leagues, challenges, and creators

That's not "a few more features" — it's a different class of product (a
marketplace + social graph + intelligence layer on top of the tracker we built).

**The single most important strategic truth for sequencing:**
> A creator will not bring their audience to a tool that is *worse* than the
> Hevy / MyFitnessPal they already use. The single-player core is the **price of
> entry**. The creator economy, community, and Gains Score are the **win**.
> So we perfect the core first, then build the moat on top of it.

---

## Guiding principles

1. **One loop before all sides.** Don't build creators, brands, and corporate
   simultaneously. Nail the member loop → then the creator loop → then brands.
2. **Don't polish what we're about to redesign.** Phase C/D visual polish gets
   applied per-surface *as* we rebuild it, never ahead of it.
3. **Spec before build.** Every phase starts from a locked section spec.
4. **Pick 2 revenue streams, park 13.** Launch on Freemium + Creator Marketplace.
   Corporate, insurance, gym deals, meal kits, etc. are post-traction.
5. **LatAm-real from day one in architecture, not features.** Design i18n and
   payment abstraction early so we don't repaint later — but build the features
   when the launch market needs them.

---

## Where we are

| Work | Status |
|------|--------|
| Build Phases 1–5 (single-player surfaces) | ✅ Shipped (against an empty DB — now live) |
| Audit Phase A (broken surfaces) | ✅ |
| Audit Phase B (UX completeness — toasts, mobile, dashboard intake) | ✅ |
| Audit Phase C (design elevation — hover, transitions, layouts) | 🔸 Partial; remainder folds into the build phases below |
| Backend live (schema applied, guest auth) | ✅ |
| Product Definition — strategy + competitive teardown | ✅ This week |
| Product Definition — section specs | ⏳ **Next (Phase 0)** |

> The old "Phase 6 = monetization, Phase 7 = mobile" plan is **superseded** by
> the roadmap below.

---

## The roadmap

Each phase: **Goal · Scope · Depends on · Exit criteria · Model & effort.**

### Phase 0 — Product Definition & Architecture  ⏳ now
**Goal:** Lock the complete blueprint so every later phase builds from a spec, not a guess.
**Scope:**
- Finish main section specs (Nutrition, Workouts, Tracker, Community, Education, Supplements) — Target + flows + open questions resolved.
- Write the **new** specs the vision introduced: **Creators**, **Social Graph & Identity**, **Gains Score (Transformation Index)**, **Monetization & Tiers**.
- Synthesize the **Dashboard** spec last.
- Design the **data architecture** for new entities (social graph, pods, leagues, challenges, creators, programs, subscriptions, transactions, affiliate events) + RLS model.
**Depends on:** strategy (✅).
**Exit:** every spec marked 🟢 locked; a data-model doc the build can execute against.
**Model & effort:** **Opus 4.8 · Extra** for the data architecture + Gains Score definition (deep, load-bearing reasoning); **Opus 4.8 · High** for the section specs.

### Phase 1 — Core Excellence (the substrate)
**Goal:** Make Nutrition, Workouts, and Tracker genuinely best-in-class — good enough that a creator is *proud* to bring their audience.
**Scope:**
- Commit to **one food database** (pick from the 6 API keys) + barcode scan; fast, accurate logging.
- Workout logging at Hevy parity (routines, PRs, rest, supersets, history) + the exercise library wired to the builder.
- Progress depth (measurements, photos comparison, real charts) — finish the Tracker stubs.
- The **connected-data plumbing** (the schema/events that later feed Gains Score).
- Apply Phase C/D polish to these surfaces as they're rebuilt.
**Depends on:** Phase 0 specs.
**Exit:** core loop (log food + workout + progress) is fast, accurate, and visibly better than the single-lane incumbents.
**Model & effort:** **Opus 4.8 · High** for the food-DB integration + data layer; **Sonnet 4.6 · High** for surface implementation.

### Phase 2 — Identity & Social Graph
**Goal:** Turn solo users into a connected network — the substrate for everything community.
**Scope:** public athlete profiles, follows/friends, privacy model, the social data layer + RLS.
**Depends on:** Phase 1 (real data worth sharing).
**Exit:** a user can find, follow, and view another athlete's (permitted) progress.
**Model & effort:** **Opus 4.8 · High** (data model, privacy, RLS are security-critical); **Sonnet 4.6 · Medium** for UI.

### Phase 3 — Community & Accountability Engine
**Goal:** Make consistency social and addictive — the retention core.
**Scope:** accountability pods (5–10), transformation leagues, challenges (creator-runnable), real leaderboards, a transformation feed. Expands the basic community/leaderboard/competitions already built.
**Depends on:** Phase 2 (social graph).
**Exit:** a user can join a pod + a challenge and see live ranking/accountability.
**Model & effort:** **Opus 4.8 · High** (social mechanics + scoring are intricate); **Sonnet 4.6 · High** for surfaces.

### Phase 4 — The Gains Score & Intelligence Layer  ⭐ signature moat
**Goal:** Ship the **Transformation Index** + connected-data recommendations — the thing no competitor has.
**Scope:** the Gains Score algorithm (combines nutrition, training, sleep, habits, recovery, progress); daily/weekly AI guidance; macros→recipes→grocery and nutrition→recovery→training intelligence (likely Claude API).
**Depends on:** Phases 1–3 (needs the connected data).
**Exit:** every user has a live Gains Score with an explainable "do this next" recommendation.
**Model & effort:** **Opus 4.8 · Extra** (algorithm design + LLM orchestration is the highest-reasoning work in the project).

### Phase 5 — Creator Economy
**Goal:** Let creators bring and monetize their communities — the actual wedge.
**Scope:** creator onboarding, creator portal, program/challenge builder, white-label mini-portals, creator analytics, the in-app marketplace.
**Depends on:** Phases 1–3 (creators need a great product + community to bring people to).
**Exit:** a creator can publish a program/challenge and members can join it.
**Model & effort:** **Opus 4.8 · High** (multi-sided architecture); **Sonnet 4.6 · High** for portal UI.

### Phase 6 — Monetization Infrastructure
**Goal:** Turn it on — subscriptions + creator payouts.
**Scope:** freemium tiers + feature gating, Stripe subscriptions (keys already present), creator marketplace payouts + take rate, the supplement affiliate network, and the **LatAm payment-rail abstraction** (Mercado Pago / local processors). Launch only **Freemium + Creator Marketplace**.
**Depends on:** Phase 5 (something to sell) + Phase 1 (premium features to gate).
**Exit:** a member can subscribe; a creator can get paid; LatAm payment path proven.
**Model & effort:** **Opus 4.8 · High** + **security-reviewer agent** (payments are high-stakes, fraud/PCI-adjacent — do not cut corners).

### Phase 7 — Virality & Content Engine
**Goal:** Make the product grow itself.
**Scope:** auto-generated **Transformation Reels** (video from user data/photos), share cards (basic version exists), referral program, the share→join loop.
**Depends on:** Phases 1–4 (real progress data worth sharing).
**Exit:** a user can one-tap generate and share a branded Reel that drives a tracked signup.
**Model & effort:** **Opus 4.8 · High** (media-gen integration); **Sonnet 4.6 · Medium** for UI.

### Phase 8 — Localization & LatAm Launch Readiness
**Goal:** Be genuinely ready for the Bolivia/LatAm launch.
**Scope:** i18n (Spanish first), finalize LatAm payments, performance/CWV pass, legal/privacy, launch ops.
**Depends on:** Phases 1–6.
**Exit:** the app is fully usable and payable in Spanish, in-market.
**Model & effort:** **Sonnet 4.6 · High** (mostly execution); **Opus 4.8 · High** for the i18n architecture decision.

### Phase 9 — Mobile Apps
**Goal:** Meet LatAm users where they are — mobile (Android-first), then iOS.
**Scope:** decide architecture (React Native/Expo rebuild vs. Capacitor wrapping the web) and ship.
**Depends on:** Phase 8 (stable, localized product to wrap/port).
**Exit:** installable Android + iOS apps of the core loop.
**Model & effort:** **Opus 4.8 · High** (new-platform architecture is a big decision); **Sonnet 4.6 · High** for the port.

### Phase 10 — Scale & Expand Revenue
**Goal:** Add the parked revenue streams once the core loop has traction.
**Scope:** corporate wellness + inter-company leagues, brand sponsorships/branded challenges, gym partnerships, coaching marketplace, the rest of the 15 streams — prioritized by traction signal.
**Depends on:** a working member + creator loop with real retention.
**Exit:** ≥2 additional revenue streams live and contributing.
**Model & effort:** **Opus 4.8 · High** for partnership/B2B architecture; **Sonnet 4.6** for features.

---

## ⭐ The first launchable milestone (MVP)

Don't wait for Phase 10 to launch. The **first creator cohort MVP** is a cross-cut:

**Phase 1 (core excellence) + a slice of Phase 2–3 (profiles, pods, creator-runnable challenges) + a slice of Phase 5–6 (a creator can run a paid challenge; members can subscribe).**

That's the minimum to test the core thesis — *"creators bring audiences to transform together, and both pay."* Everything else (Gains Score depth, Reels, mobile, corporate, the other revenue streams) is layered **after** the loop is proven with real creators.

We'll define the exact MVP feature cut at the end of Phase 0, once the specs are locked.

---

## Honest risks

- **Scope is the killer.** This is a platform, not an app. The discipline of "one loop before all sides" is what makes it survivable.
- **Marketplace cold-start.** Creators need audiences and audiences need creators. The GTM (start with 10k–500k micro-influencers) is the right answer — but it means the creator tools must be genuinely time-saving from v1.
- **LatAm payments are hard.** Stripe coverage is thin in the launch market; the payment abstraction in Phase 6 is non-negotiable and non-trivial.
- **The core must be elite.** If Phase 1 isn't as good as Hevy, the whole creator thesis stalls. Don't rush it.

---

## Status legend
⏳ now · ✅ done · 🔸 partial · ⚪ not started
