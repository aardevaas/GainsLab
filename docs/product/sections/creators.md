# Spec: Creators

> **The wedge.** Per strategy: *"creators are the soul of GainsLab."* This is the
> spec that turns a great single-player app into a creator-led transformation
> platform. It sits on the **Social Graph** substrate and feeds the
> **Monetization** model. New surface — does not exist in the current app.

## Job
Let a fitness creator **bring their audience into GainsLab, run their community,
and monetize** — while GainsLab does all the heavy lifting (tools, hosting,
payments, accountability) so the creator just creates. The creator's *business*
lives here, which is also the deepest switching-cost moat.

## Target

**The promise to creators (strategy §6):** *"We do everything for the creators —
they're the soul of GainsLab."* The whole design goal is **save them time and
money** vs. their status quo (PDFs in Google Drive, payments via DMs, no
accountability, no data).

**What a creator can do:**
- **Onboard in minutes** — any user can become a creator; dead-simple setup.
  Critically: **import/migrate existing assets** (their PDF programs, meal plans)
  and we help digitize them into native, trackable GainsLab programs.
- **Publish, to their community, in one tap each:**
  - **Programs/routines** (→ Workouts: members adopt as their plan)
  - **Meal plans** (→ Nutrition: members adopt; macros/recipes/grocery flow)
  - **Challenges** with **custom Gains Score weightings** (locked decision #5 — a
    creator's "cut challenge" weights Nutrition higher)
  - **Educational content** (→ Education: their voice, their trust)
  - **Leagues** they own (their audience competes amongst themselves)
- **White-label mini-portal** — a creator-branded space (their name, logo, colors)
  their audience lands in. Their members feel like they're in *the creator's* app,
  powered by GainsLab. This is the "their business lives here" lock-in.
- **See their community's progress** (permitted data) — aggregate dashboards +
  per-member accountability, so the creator can actually coach at scale.
- **Earn** — subscriptions to their community, paid programs/challenges, and
  brand/store **codes & partnerships** (a perk creators love). Platform take
  **10–20%** (model defined now; *payment flow built in the Monetization phase*).
- **Creator analytics** — members, engagement, retention, earnings, member results.

**Why a creator switches and stays:** their audience, their content, their income,
and their accountability data all live in one place. Leaving means rebuilding their
business from scratch. That's the moat.

## Information & hierarchy
- **Creator portal (separate surface from the member app):** today's snapshot —
  active members, engagement, earnings, active challenges/programs; quick "publish."
- **Member-facing creator profile / mini-portal:** the creator's branded hub —
  their programs, challenges, content, and "join my community" CTA.
- **Hero for the creator:** *is my community active and growing, and what do I
  publish next.* Hero for their member: *what has my creator set for me today.*

## Core entities introduced (feeds the data-architecture spec)
- `creators` — profile extension (is_creator, handle, bio, branding, tier; payout details deferred to Monetization).
- `creator_memberships` — the member↔creator relationship (+ tier: free follower vs. paid subscriber).
- `programs` — workout programs (creator-authored or first-party), adoptable into a member's plan.
- `meal_plans` — nutrition plans, adoptable.
- `challenges` — scope (creator/global), dates, **custom weighting profile**, prize, entry terms.
- `creator_content` — educational posts.
- `creator_codes` — promo/affiliate codes & brand/store partnerships.
- Built on the **Social Graph** (follow/subscribe) and read by **Monetization**
  (subscriptions, marketplace take, payouts).

## Connections
- **Social Graph** — the substrate (follow/subscribe; creator↔member edges). Built first.
- **Workouts / Nutrition** — programs & meal plans publish into these as adoptable content.
- **Community** — creators run challenges/leagues for their audiences (member-side in Community spec).
- **Education** — creators author content.
- **Gains Score** — challenges re-weight its pillars; creators coach against members' scores.
- **Monetization** — subscriptions + marketplace take + codes (flow built late; EBANX, LatAm).
- **Virality** — creators' communities sharing Reels = the acquisition flywheel.

## Flows
- **Become a creator:** upgrade → set branding → import/build first program → publish → invite audience.
- **Member joins a creator:** discover/invite → join (free or paid) → adopt the creator's program/plan/challenge → progress visible to the creator for accountability.
- **Creator runs a challenge:** define goal + custom weighting + dates + prize → community competes on the relevant Gains Score pillars → results + payouts.

## Open questions  *(synthesized — flag any you'd change)*
- [ ] **Creator eligibility** — open to all from day one, or application/curation for the first cohort? *(Lean: curated first cohort of micro-influencers per the GTM, then open.)*
- [ ] **Free-follower vs. paid-subscriber** split per creator — does each creator set their own tiers/pricing (within platform guardrails)? *(Lean: yes — creators set pricing; platform sets the take rate + floors.)*
- [ ] **White-label depth** — branding/colors/logo (v1) vs. custom domains (later)? *(Lean: in-app branding v1; domains post-traction.)*
- [ ] How much member data does a creator see by default — and what's the member's consent model? *(Ties to Social Graph privacy; lean: members opt into sharing progress with creators they join.)*