# Spec: Social Graph & Identity

> The **substrate** under Community and Creators. Get this right once and both
> sit on it cleanly; get it wrong and we rework the whole social side. New
> surface — only a basic single-user profile exists today.

## Job
Turn isolated accounts into a connected network of athletes, friends, pods, and
creator communities — with a privacy model people trust — so every social and
creator feature has one consistent relationship + identity layer to build on.

## Target

**Identity:** every user has a **public athlete profile** (handle, display name,
avatar, bio, goal, headline stats, **Gains Score** if public, achievements/badges,
transformation highlights). This is the unit people follow, rank, and share.

**The relationship edges (one graph, several edge types):**
- **Follow** — lightweight, asymmetric (à la Strava/IG). Drives the feed + discovery.
- **Friend** *(optional, mutual)* — closer tier for higher-trust sharing.
- **Pod membership** — belongs to an accountability pod (Community).
- **Creator subscription** — member↔creator edge, free or paid (Creators).
- **League/challenge participation** — scoped membership in a competition (Community).

All of these are edges on **one social graph** — not five bespoke systems. That
unification is the whole point of speccing this before Community/Creators build.

**Privacy model (the load-bearing decision):** per Gains Score decision #3,
**public by default with granular private controls.** Privacy is **per-data-type**,
not all-or-nothing:
- Profile + Gains Score: public by default, toggle private.
- **Progress photos: private by default** (sensitive), opt-in to share.
- Body weight / measurements: private by default; trends/score derived from them can be public.
- Granular share scopes: public · followers · friends · my pod · my creators only.
- A member explicitly **consents to share progress with a creator** when they join
  that creator's (paid) community — that's the accountability data grant.

**Discovery:** find people by handle, invite contacts/friends, find your creators,
suggested pods (auto-match by goal/level/timezone to solve cold-start).

## Information & hierarchy
- **Profile** is the hero identity object — everything links to it.
- A user sees: their own profile/score, people they follow (feed), their pods,
  their creators. Discovery is one tap away.

## Core entities (feeds data-architecture spec)
- `profiles` — extend the existing table: handle (unique), bio, branding, privacy
  settings (per-type), is_creator flag.
- `follows` — (follower_id, following_id) directed edges.
- `friendships` — mutual (optional tier).
- `privacy_settings` — per-user, per-data-type visibility scopes.
- Pod/creator/challenge membership tables live in their specs but **reference this
  graph** (foreign keys to profiles), never re-implement identity.

## Connections
- **Everything social** — Community (pods, leagues, feed) and Creators
  (subscriptions, member data) are *consumers* of this graph.
- **Gains Score** — visibility of score/pillars governed by the privacy model here.
- **Tracker** — progress-photo + measurement privacy defaults defined here.
- **Virality** — shareable profile + transformation = the outbound unit.

## Flows
- Set up profile (handle, avatar, privacy) → become discoverable per your settings.
- Follow an athlete / join a creator / get matched to a pod → edges created on the one graph.
- Adjust a privacy scope → consistently enforced across feed, leaderboards, creator views.

## Open questions  *(synthesized — flag any you'd change)*
- [ ] **Handles** — unique global usernames now (reserve the namespace early — costly to retrofit). *(Lean: yes, lock handles in this phase.)*
- [ ] Friend tier in v1, or follow-only to start and add friends later? *(Lean: follow-only v1; the schema anticipates friendships so adding it is additive.)*
- [ ] Block/report/safety tooling — minimum viable set for a public social product (needed before any public launch).