-- GainsLab — Initial Schema
-- Run in: Supabase > SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  name text,
  username text unique,
  avatar_url text,
  date_of_birth date,
  sex text check (sex in ('male', 'female')),
  height_cm numeric(5,1),
  weight_kg numeric(5,1),
  goal text check (goal in ('lose_weight','maintain','gain_muscle','improve_endurance','general_fitness')),
  activity_level text check (activity_level in ('sedentary','light','moderate','active','very_active','extra_active')),
  units text not null default 'metric' check (units in ('metric','imperial')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- DIETARY PROFILES
-- ─────────────────────────────────────────
create table if not exists dietary_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  diet_type text check (diet_type in ('omnivore','vegetarian','vegan','pescatarian','keto','paleo','mediterranean')),
  restrictions text[] not null default '{}',
  allergies text[] not null default '{}',
  diseases text[] not null default '{}',
  disliked_foods text[] not null default '{}',
  macro_preset text check (macro_preset in ('balanced','high_protein','low_carb','high_carb','keto','zone')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- BODY MEASUREMENTS
-- ─────────────────────────────────────────
create table if not exists body_measurements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  weight_kg numeric(5,1),
  body_fat_pct numeric(4,1),
  lean_mass_kg numeric(5,1),
  waist_cm numeric(5,1),
  chest_cm numeric(5,1),
  hips_cm numeric(5,1),
  left_arm_cm numeric(4,1),
  right_arm_cm numeric(4,1),
  left_thigh_cm numeric(4,1),
  right_thigh_cm numeric(4,1),
  neck_cm numeric(4,1),
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

-- ─────────────────────────────────────────
-- FOOD LOGS
-- ─────────────────────────────────────────
create table if not exists food_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  food_id text,
  food_name text not null,
  brand text,
  quantity numeric(8,2) not null,
  unit text not null,
  calories numeric(7,1) not null,
  protein_g numeric(6,1) not null,
  carbs_g numeric(6,1) not null,
  fat_g numeric(6,1) not null,
  fiber_g numeric(6,1),
  sugar_g numeric(6,1),
  sodium_mg numeric(8,1),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- WORKOUT PLANS
-- ─────────────────────────────────────────
create table if not exists workout_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  days_per_week int not null check (days_per_week between 1 and 7),
  goal text,
  difficulty text check (difficulty in ('beginner','intermediate','advanced')),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workout_days (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid references workout_plans(id) on delete cascade not null,
  day_number int not null,
  name text not null,
  muscle_focus text[] not null default '{}',
  "order" int not null default 0
);

create table if not exists workout_exercises (
  id uuid primary key default uuid_generate_v4(),
  day_id uuid references workout_days(id) on delete cascade not null,
  exercise_id text not null,
  exercise_name text not null,
  sets int not null,
  reps int,
  duration_seconds int,
  weight_kg numeric(5,1),
  rest_seconds int not null default 60,
  notes text,
  "order" int not null default 0
);

-- ─────────────────────────────────────────
-- WORKOUT SESSIONS
-- ─────────────────────────────────────────
create table if not exists workout_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_id uuid references workout_plans(id) on delete set null,
  date date not null default current_date,
  duration_minutes int,
  calories_burned int,
  notes text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists session_sets (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references workout_sessions(id) on delete cascade not null,
  exercise_id text not null,
  exercise_name text not null,
  set_number int not null,
  reps int,
  weight_kg numeric(5,1),
  duration_seconds int,
  notes text
);

-- ─────────────────────────────────────────
-- PROGRESS PHOTOS
-- ─────────────────────────────────────────
create table if not exists progress_photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  date date not null default current_date,
  notes text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- SLEEP LOGS (model ready, UI in Phase mobile)
-- ─────────────────────────────────────────
create table if not exists sleep_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  hours numeric(3,1) not null,
  quality_rating int not null check (quality_rating between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

-- ─────────────────────────────────────────
-- RECIPES & GROCERY
-- ─────────────────────────────────────────
create table if not exists saved_recipes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  recipe_id text not null,
  source text not null check (source in ('themealdb','spoonacular','custom')),
  recipe_snapshot jsonb not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists liked_dishes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  dish_name text not null,
  recipe_id text,
  recipe_snapshot jsonb,
  created_at timestamptz not null default now()
);

create table if not exists grocery_lists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  week_of date not null,
  is_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists grocery_items (
  id uuid primary key default uuid_generate_v4(),
  list_id uuid references grocery_lists(id) on delete cascade not null,
  ingredient text not null,
  quantity numeric(8,2),
  unit text,
  is_checked boolean not null default false,
  category text
);

-- ─────────────────────────────────────────
-- COMMUNITY & COMPETITIONS
-- ─────────────────────────────────────────
create table if not exists competitions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  type text not null check (type in ('steps','calories_burned','workouts','streak','weight_loss','custom')),
  start_date date not null,
  end_date date not null,
  prize_description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists competition_entries (
  id uuid primary key default uuid_generate_v4(),
  competition_id uuid references competitions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  score numeric(12,2) not null default 0,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(competition_id, user_id)
);

create table if not exists leaderboard_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  score numeric(12,2) not null default 0,
  period text not null check (period in ('weekly','monthly','all_time')),
  updated_at timestamptz not null default now(),
  unique(user_id, category, period)
);

-- ─────────────────────────────────────────
-- BODY AGE ASSESSMENTS
-- ─────────────────────────────────────────
create table if not exists body_age_assessments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  pushup_max int,
  situp_max int,
  resting_hr int,
  flexibility_score int check (flexibility_score between 1 and 5),
  mile_time_minutes numeric(5,2),
  body_age_score int,
  chronological_age int,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- SUBSCRIPTIONS
-- ─────────────────────────────────────────
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  plan text not null default 'free' check (plan in ('free','pro','elite')),
  status text not null default 'active' check (status in ('active','cancelled','past_due','trialing')),
  stripe_customer_id text,
  stripe_subscription_id text,
  period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
create index if not exists idx_food_logs_user_date on food_logs(user_id, date);
create index if not exists idx_body_measurements_user_date on body_measurements(user_id, date);
create index if not exists idx_workout_sessions_user_date on workout_sessions(user_id, date);
create index if not exists idx_progress_photos_user_date on progress_photos(user_id, date);
create index if not exists idx_competition_entries_competition on competition_entries(competition_id);
create index if not exists idx_leaderboard_scores_period on leaderboard_scores(period, category, score desc);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
alter table profiles enable row level security;
alter table dietary_profiles enable row level security;
alter table body_measurements enable row level security;
alter table food_logs enable row level security;
alter table workout_plans enable row level security;
alter table workout_days enable row level security;
alter table workout_exercises enable row level security;
alter table workout_sessions enable row level security;
alter table session_sets enable row level security;
alter table progress_photos enable row level security;
alter table sleep_logs enable row level security;
alter table saved_recipes enable row level security;
alter table liked_dishes enable row level security;
alter table grocery_lists enable row level security;
alter table grocery_items enable row level security;
alter table competitions enable row level security;
alter table competition_entries enable row level security;
alter table leaderboard_scores enable row level security;
alter table body_age_assessments enable row level security;
alter table subscriptions enable row level security;

-- Profiles: own + public usernames readable by all
create policy "profiles_own" on profiles for all using (auth.uid() = user_id);

-- Dietary profiles: own only
create policy "dietary_own" on dietary_profiles for all using (auth.uid() = user_id);

-- Body measurements: own only
create policy "measurements_own" on body_measurements for all using (auth.uid() = user_id);

-- Food logs: own only
create policy "food_logs_own" on food_logs for all using (auth.uid() = user_id);

-- Workout plans: own + public readable
create policy "workout_plans_own" on workout_plans for all using (auth.uid() = user_id);
create policy "workout_plans_public_read" on workout_plans for select using (is_public = true);

-- Workout days/exercises: via plan ownership
create policy "workout_days_own" on workout_days for all
  using (plan_id in (select id from workout_plans where user_id = auth.uid()));

create policy "workout_exercises_own" on workout_exercises for all
  using (day_id in (
    select wd.id from workout_days wd
    join workout_plans wp on wd.plan_id = wp.id
    where wp.user_id = auth.uid()
  ));

-- Sessions: own
create policy "sessions_own" on workout_sessions for all using (auth.uid() = user_id);
create policy "session_sets_own" on session_sets for all
  using (session_id in (select id from workout_sessions where user_id = auth.uid()));

-- Progress photos: own + public
create policy "photos_own" on progress_photos for all using (auth.uid() = user_id);
create policy "photos_public_read" on progress_photos for select using (is_public = true);

-- Sleep: own
create policy "sleep_own" on sleep_logs for all using (auth.uid() = user_id);

-- Recipes/grocery: own
create policy "saved_recipes_own" on saved_recipes for all using (auth.uid() = user_id);
create policy "liked_dishes_own" on liked_dishes for all using (auth.uid() = user_id);
create policy "grocery_lists_own" on grocery_lists for all using (auth.uid() = user_id);
create policy "grocery_items_own" on grocery_items for all
  using (list_id in (select id from grocery_lists where user_id = auth.uid()));

-- Competitions: all read, own entry
create policy "competitions_read" on competitions for select using (true);
create policy "competition_entries_own" on competition_entries for all using (auth.uid() = user_id);
create policy "leaderboard_read" on leaderboard_scores for select using (true);
create policy "leaderboard_own" on leaderboard_scores for all using (auth.uid() = user_id);

-- Body age: own
create policy "body_age_own" on body_age_assessments for all using (auth.uid() = user_id);

-- Subscriptions: own
create policy "subscriptions_own" on subscriptions for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- TRIGGER: auto-create profile on signup
-- ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- TRIGGER: updated_at auto-bump
-- ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on profiles
  for each row execute procedure public.set_updated_at();
create trigger set_dietary_updated_at before update on dietary_profiles
  for each row execute procedure public.set_updated_at();
create trigger set_workout_plans_updated_at before update on workout_plans
  for each row execute procedure public.set_updated_at();
create trigger set_grocery_lists_updated_at before update on grocery_lists
  for each row execute procedure public.set_updated_at();
create trigger set_subscriptions_updated_at before update on subscriptions
  for each row execute procedure public.set_updated_at();
create trigger set_competition_entries_updated_at before update on competition_entries
  for each row execute procedure public.set_updated_at();
