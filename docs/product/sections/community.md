# Section: Community

> Covers: Community hub, leaderboard, competitions, share cards.

## Job
Make consistency social — turning solo effort into shared momentum, friendly
competition, and a reason to come back and bring others.

## Today (live in code)
- **`/community`** — hub: stat strip (streak, workouts/week, nutrition days),
  featured competition, and 3 cards (Leaderboard, Competitions, Share). Full-
  width, 3-col card grid.
- **`/community/leaderboard`** — ranks users by category (workouts/nutrition/
  streak) across periods; current user highlighted.
- **`/community/competitions`** + **`/[id]`** — join monthly challenges; scores
  computed from activity; entry leaderboards.
- **`/community/share`** — generates a 1080×1080 Instagram-style summary card
  (via `next/og`) + copyable caption.
- Scores synced via `syncMyScores()` (streak walk + weekly counts) into
  `leaderboard_scores`.

## Target  *(synthesized from strategy §5–7 — react/adjust)*

Community is **the core wedge and the retention engine** — not a layer on top.
Per the strategy: GainsLab wins by being where **creators bring their communities
to transform together.** Competition/accountability is the emotional hook that
turns a solo tracker into a movement.

> This spec covers the **member-side social mechanics** (graph, pods, leagues,
> challenges, leaderboards, feed, sharing). The **creator-side** authoring,
> publishing, white-label portals, and payouts live in the **Creators** spec.
> They share one substrate: the **Social Graph** spec.

**The mechanics (from strategy §7), prioritized:**
- **Accountability Pods** (5–10 people, shared goals, daily check-ins, weekly
  ranking) — the intimate retention unit; highest-priority social primitive.
- **Challenges** — creator-run *and* platform-run; **scored by the Gains Score or
  any pillar, with per-challenge custom weightings** (locked Gains Score decision
  #5 — a "cut challenge" weights Nutrition higher). This is a first-class concept.
- **Leagues / leaderboards** — creator-owned (their audience) + global + goal-based
  transformation leagues; ranked by Gains Score / pillars / streak.
- **Transformation feed** — progress posts, milestones, before/afters, reactions.
- **Later flavors (strategy §7):** national/city cups, duel arena (1v1 stakes),
  squad/family plans, guilds, seasonal worlds — built once the core loop proves out.

**The viral loop (strategy §7):** progress/transformation → one-tap **Transformation
Reel** (auto-generated, branded, referral-tagged) → shared to IG/TikTok → friends
join → enter challenges → more accountability → more content. *(Reel generation =
the Virality phase; Community provides the shareable moments.)*

**Prizes:** status/badges/tiers from day one (cheap, scalable); real prizes &
sponsorships arrive with brand deals (post-traction, strategy revenue stream 4).

## Information & hierarchy
- **Emotional hook:** belonging + accountability first (pods), competition + status
  second (leagues/challenges). People stay for the pod; they invite for the brag.
- **Hero:** your pod + active challenges (where do I stand *with my people today*).
- **Secondary:** leagues/leaderboards, the transformation feed, discover creators.
- **The "post/invite" trigger:** a milestone or rank change → prompt to share a Reel.

## Connections
- **Social Graph spec** — the follows/friends/pod-membership substrate (built first).
- **Gains Score** — the universal ranking currency; challenges can re-weight its pillars.
- **Creators spec** — creators run leagues/challenges/programs for their communities.
- **Workouts + Nutrition + Tracker** — all activity feeds scores → standings.
- **Virality** — milestones generate shareable Reels (the acquisition loop).
- **Monetization** — challenge entry / creator subs; sponsorships fund prize pools.
- **Dashboard** — your pod standing + active challenge surface here.

## Flows
- Join/get-placed in a pod → daily check-ins → weekly ranking keeps you accountable.
- Join a creator's (custom-weighted) challenge → compete on the relevant pillars → earn status/prize.
- Hit a milestone → one-tap share a Reel → friends join.

## Open questions  *(resolved per strategy; nothing blocking)*
- [ ] **Pod formation** — auto-matched (by goal/level/timezone), creator-assigned, or self-formed with friends? *(Lean: all three; auto-match is the default that solves cold-start.)*
- [ ] Privacy default = **public with private toggle** (matches Gains Score decision #3); confirm progress-photo default stays private.
