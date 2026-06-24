-- ─────────────────────────────────────────
-- Phase 1.6 — Workout logging at Hevy parity
-- Adds RPE (rate of perceived exertion) + warmup flag to logged sets.
-- Additive only; existing rows default cleanly. e1RM, volume, and PRs are
-- derived on read from reps/weight history — no extra tables needed.
-- ─────────────────────────────────────────

alter table session_sets add column if not exists rpe numeric;          -- 6.0–10.0 (RPE) or null
alter table session_sets add column if not exists is_warmup boolean not null default false;

-- History/PR lookups scan a user's sets per exercise; index the hot path.
create index if not exists session_sets_exercise_idx on session_sets (exercise_id);
create index if not exists workout_sessions_user_date_idx on workout_sessions (user_id, date desc);
