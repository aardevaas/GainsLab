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

## Target  **[YOU]**
> _You mentioned a brilliant community/virality idea. What is it? What makes
> people invite others and stay? Is community the core wedge or a retention
> layer on top of the product?_

## Information & hierarchy  **[YOU]**
> _What's the emotional hook — competition, belonging, status, accountability?
> What does a user see that makes them post / invite a friend?_

## Connections
- **Workouts + Nutrition + Tracker** — all activity feeds scores.
- **Share** — content engine for organic acquisition (the viral loop).
- **Monetization** — competitions mention "Pro subscriptions" as prizes.
- **Dashboard** — community standing could surface as a stat.

## Flows
- Check leaderboard standing → feel motivated to log.
- Join a competition → compete → earn status/prize.
- Generate a share card → post to IG/X → drive signups.

## Open questions  **[YOU]**
- [ ] Friends/follows/teams, or global leaderboards only?
- [ ] The viral mechanism — what specifically makes sharing irresistible?
- [ ] Are competitions the retention core or a seasonal hook?
- [ ] Real prizes / sponsorships, or status/badges?
- [ ] Privacy: how much progress is public by default?
