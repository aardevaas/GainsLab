# Spec: Monetization & Tiers (model)

> **Design the money *model* now; turn the money *flow* on late** (roadmap
> principle #7). This spec defines the entitlement layer every feature reads from
> day one — even though nothing charges until the Monetization *Activation* phase.
> Payment processor = **EBANX** (LatAm-first), not Stripe.

## Job
Give the whole app one consistent notion of **"who is entitled to what"** so
feature-gating is declarative everywhere, and define the revenue relationships
(member subs, creator subs, marketplace take, affiliate) — without building any
payment flow yet. Everything resolves to "free" until activation.

## The two launch revenue streams (park the other 13)
Per strategy + roadmap: launch on **(1) Freemium member subscriptions** and
**(2) Creator Marketplace take**. Corporate, insurance, gym deals, meal kits,
sponsorships, etc. are post-traction — the model below leaves room for them but we
build only these two.

## The entitlement model (the part that ships in Phase 0)

**Core idea:** features never check "is this user paid?" directly. They check an
**entitlement** — a capability flag resolved from the user's plan(s). This
indirection is what prevents rework: we add/rename plans or flip pricing without
touching feature code.

```
entitlement check:  can(user, "nutrition.adaptive_macros") -> bool
```

- **Entitlements** = named capabilities (e.g. `analytics.deep`, `nutrition.adaptive_macros`,
  `ai.coaching`, `creator.publish`, `history.unlimited`). Features gate on these.
- **Plans/Tiers** = bundles of entitlements:
  - **Free** — generous (acquisition + habit-building; the Gains Score, core
    logging, basic community all free — generosity is a wedge vs. paywall-fatigued
    incumbents).
  - **Premium** — advanced analytics, AI personalization/coaching, adaptive macros,
    full meal/grocery builder, unlimited history, ad-free.
  - **Creator** — `creator.publish` + portal + analytics (may itself be free to
    create, monetized via marketplace take).
- **Resolution:** a user's active plan(s) → union of entitlements → `can()` checks.
  Until activation, everyone resolves to a config that grants everything as "free."

> **Phase 1+ requirement:** as each premium-ish feature is built, it declares its
> entitlement key and gates on `can()`. No money, no checkout — just the check,
> reading a config that's all-free for now. Flip the config at activation.

## Creator monetization (model now, payouts later)
- **Members subscribe to a creator** (free follower vs. paid subscriber tier;
  creators set their own pricing within platform floors/guardrails).
- **Paid programs/challenges** — one-off or subscription, sold in-app.
- **Platform take rate 10–20%** on creator revenue.
- **Creator codes / affiliate** — brand & local-store partnerships (esp. LatAm);
  creators get their own codes (a perk). Tracked as affiliate events.

## Payment abstraction (built at activation, designed now)
- A `PaymentProvider` interface (create subscription, charge, refund, payout,
  webhook) with the **EBANX** adapter first (LatAm coverage); region-routable so
  other processors slot in later. Same provider-abstraction principle as food/media.
- **Never store raw card data** — processor-tokenized only (PCI-adjacent; the
  security-reviewer agent gates this phase).

## Core entities (feeds data-architecture spec; most are nullable/dormant until activation)
- `plans` — tier definitions + their entitlement sets.
- `entitlements` — capability registry; `plan_entitlements` join.
- `subscriptions` — user↔plan (member premium) and user↔creator (creator sub), status, period.
- `transactions` — purchases (programs/challenges), processor refs.
- `payouts` — creator earnings + platform take records.
- `affiliate_events` — supplement/brand/creator-code conversions.
- `creator_codes` — (defined in Creators spec) referenced here for attribution.

## Connections
- **Every feature** — reads `can()` entitlement checks (declared as features are built).
- **Creators** — subscriptions, marketplace take, codes.
- **Supplements** — affiliate events.
- **Gains Score / Analytics** — history depth + AI coaching are premium entitlements.
- **Activation phase** — wires EBANX + checkout + payouts onto this model.

## Open questions  *(synthesized — flag any you'd change)*
- [ ] **The free/premium line** — exact entitlement split (what's free vs. paywalled). *(Lean: Gains Score + core logging + basic community free; AI/coaching/deep-analytics/adaptive-macros/unlimited-history premium. Finalize near activation with real usage data.)*
- [ ] **Price points** — member premium $/mo and the creator take % (10 vs. 15 vs. 20). *(Defer to activation; the model is price-agnostic.)*
- [ ] **Creator-sub pricing control** — platform floors/ceilings or fully creator-set? *(Lean: creator-set within platform guardrails.)*