-- GainsLab — Phase 1 Foundations
-- Run in: Supabase > SQL Editor (after 001_initial_schema.sql)
--
-- Scope (deliberately tight — only what Phase 1 "Core Excellence" needs):
--   • profiles + timezone        (Gains Score uses the user's LOCAL day)
--   • food_logs + full label     (Nutrition full-label normalization)
--   • daily_targets              (snapshot targets — survives goal changes)
--   • daily_metrics              (THE SPINE every consumer reads)
--   • foods / exercises (cache)  (provider-abstraction local cache)
-- Deferred to their phases (additive later, no rework): profiles social fields
-- (Phase 2), workout_plans creator fields (Phase 5), competitions→challenges
-- generalization (Phase 3), monetization tables (Phase 6).

create extension if not exists pg_trgm;  -- trigram search for the foods cache

-- ─────────────────────────────────────────
-- ALTERATIONS (additive, safe to re-run)
-- ─────────────────────────────────────────

-- Local-day support for the Gains Score
alter table profiles add column if not exists timezone text not null default 'UTC';

-- Full nutrition label on food_logs (fiber_g, sugar_g, sodium_mg already exist)
alter table food_logs add column if not exists saturated_fat_g numeric(6,1);
alter table food_logs add column if not exists trans_fat_g      numeric(6,1);
alter table food_logs add column if not exists cholesterol_mg   numeric(8,1);
alter table food_logs add column if not exists added_sugar_g    numeric(6,1);
alter table food_logs add column if not exists micronutrients   jsonb;  -- {nutrient_key: amount}

-- ─────────────────────────────────────────
-- DAILY TARGETS  (snapshot per user per day)
-- ─────────────────────────────────────────
create table if not exists daily_targets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  calorie_target  numeric(7,1),
  protein_target  numeric(6,1),
  carb_target     numeric(6,1),
  fat_target      numeric(6,1),
  training_freq_target int,          -- target sessions / week
  goal text,                         -- snapshot of the goal used that day
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ─────────────────────────────────────────
-- DAILY METRICS  (THE SPINE — gains-score §4.1)
-- One row per user per day; every consumer (Gains Score, streaks,
-- leaderboards, creator analytics, AI) reads from THIS, not raw tables.
-- ─────────────────────────────────────────
create table if not exists daily_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  -- raw inputs captured that day
  calories_in numeric(7,1), protein_g numeric(6,1), carbs_g numeric(6,1), fat_g numeric(6,1),
  calorie_target numeric(7,1), protein_target numeric(6,1),
  trained boolean default false, session_count_week int, training_volume numeric, est_1rm_snapshot numeric,
  sleep_minutes int, sleep_quality int,                 -- nullable until Recovery ships
  logged_food boolean default false, logged_workout boolean default false, logged_progress boolean default false,
  weight_kg numeric(5,1), body_fat_pct numeric(4,1),    -- nullable; carried-forward trend
  -- computed pillar sub-scores (0..100, null if pillar unavailable)
  pillar_nutrition numeric(5,1), pillar_training numeric(5,1), pillar_recovery numeric(5,1),
  pillar_consistency numeric(5,1), pillar_progress numeric(5,1),
  daily_score numeric(5,1), gains_score numeric(5,1),   -- gains_score = 7-day EWMA
  goal_snapshot text,
  computed_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ─────────────────────────────────────────
-- FOODS CACHE  (provider-abstraction local cache → our proprietary DB over time)
-- ─────────────────────────────────────────
create table if not exists foods (
  id uuid primary key default uuid_generate_v4(),
  source text not null,                 -- 'usda' | 'off' | 'fatsecret' | 'custom'
  source_id text,                       -- id within the source
  barcode text,
  name text not null,
  brand text,
  serving_qty numeric(8,2), serving_unit text, serving_grams numeric(8,2),
  calories numeric(7,1), protein_g numeric(6,1), carbs_g numeric(6,1), fat_g numeric(6,1),
  saturated_fat_g numeric(6,1), trans_fat_g numeric(6,1), cholesterol_mg numeric(8,1),
  sodium_mg numeric(8,1), fiber_g numeric(6,1), sugar_g numeric(6,1), added_sugar_g numeric(6,1),
  micronutrients jsonb,
  verified boolean not null default false,   -- USDA → true ("verified" badge)
  created_at timestamptz not null default now(),
  unique (source, source_id)
);
create index if not exists foods_barcode_idx on foods (barcode);
create index if not exists foods_name_trgm_idx on foods using gin (name gin_trgm_ops);

-- ─────────────────────────────────────────
-- EXERCISES CACHE  (rich media: multiple images + ROM gif)
-- ─────────────────────────────────────────
create table if not exists exercises (
  id uuid primary key default uuid_generate_v4(),
  source text not null,                 -- 'free-exercise-db' | 'exercisedb' | 'custom'
  source_id text,
  name text not null,
  category text, equipment text,
  primary_muscles text[], secondary_muscles text[],
  instructions text[],
  images text[],                        -- multiple images (start/end)
  gif_url text,                         -- range-of-motion animation
  created_at timestamptz not null default now(),
  unique (source, source_id)
);
create index if not exists exercises_name_trgm_idx on exercises using gin (name gin_trgm_ops);

-- ─────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────
alter table daily_targets enable row level security;
alter table daily_metrics enable row level security;
alter table foods    enable row level security;
alter table exercises enable row level security;

-- Per-user owned data
drop policy if exists daily_targets_own on daily_targets;
create policy daily_targets_own on daily_targets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists daily_metrics_own on daily_metrics;
create policy daily_metrics_own on daily_metrics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Shared reference data: anyone authenticated reads; authenticated users may
-- populate the cache (public food/exercise data, not sensitive).
drop policy if exists foods_read on foods;
create policy foods_read on foods for select using (true);
drop policy if exists foods_write on foods;
create policy foods_write on foods for insert with check (auth.uid() is not null);
drop policy if exists foods_update on foods;
create policy foods_update on foods for update using (auth.uid() is not null);

drop policy if exists exercises_read on exercises;
create policy exercises_read on exercises for select using (true);
drop policy if exists exercises_write on exercises;
create policy exercises_write on exercises for insert with check (auth.uid() is not null);
drop policy if exists exercises_update on exercises;
create policy exercises_update on exercises for update using (auth.uid() is not null);
