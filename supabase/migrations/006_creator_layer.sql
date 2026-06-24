-- ============================================================
-- 006: Creator layer — applications, profiles, programs,
--      client roster, communities, recipes, check-ins
-- ============================================================

-- ─────────────────────────────────────────
-- PROFILE ADDITIONS
-- ─────────────────────────────────────────

alter table public.profiles
  add column if not exists is_creator boolean not null default false;

-- ─────────────────────────────────────────
-- CREATOR APPLICATIONS
-- Pending queue — admin approves → creator_profiles row created
-- ─────────────────────────────────────────

create table if not exists public.creator_applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users not null,
  full_name       text not null,
  bio             text,
  specialty       text[] not null default '{}',
  instagram_url   text,
  youtube_url     text,
  tiktok_url      text,
  experience_years integer,
  certifications  text,
  motivation      text not null,
  status          text not null default 'pending'
                  check (status in ('pending', 'approved', 'rejected')),
  reviewed_by     uuid references auth.users,
  review_note     text,
  reviewed_at     timestamptz,
  submitted_at    timestamptz not null default now(),
  constraint creator_applications_user_id_key unique (user_id)
);

alter table public.creator_applications enable row level security;

create policy "Users view own application"
  on public.creator_applications for select
  using (auth.uid() = user_id);

create policy "Users submit own application"
  on public.creator_applications for insert
  with check (auth.uid() = user_id);

-- Admins read all applications
create policy "Admins manage applications"
  on public.creator_applications for all
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and is_admin = true
    )
  );

-- ─────────────────────────────────────────
-- CREATOR PROFILES
-- Created by admin on approval; one per creator
-- ─────────────────────────────────────────

create table if not exists public.creator_profiles (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references auth.users not null unique,
  -- public identity
  display_name         text not null,
  slug                 text not null unique,    -- used in /creator/[slug]
  bio                  text,
  avatar_url           text,
  cover_url            text,
  -- specialty + location
  specialty            text[] not null default '{}',
  country              text,
  city                 text,
  languages            text[] not null default '{}',
  -- social links
  instagram_url        text,
  youtube_url          text,
  tiktok_url           text,
  website_url          text,
  -- credentials
  certifications       text,
  experience_years     integer,
  -- monetization config
  community_price_bob  numeric(10,2),           -- monthly membership price (null = free)
  platform_cut_pct     numeric(4,1) not null default 10,
  -- denormalised stats (updated by triggers / background jobs)
  total_clients        integer not null default 0,
  total_transformations integer not null default 0,
  avg_client_rating    numeric(3,1),
  -- status flags
  is_verified          boolean not null default false,
  is_featured          boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.creator_profiles enable row level security;

-- Public storefront — anyone can read
create policy "Creator profiles are public"
  on public.creator_profiles for select
  using (true);

-- Only the creator can update their own profile
create policy "Creator updates own profile"
  on public.creator_profiles for update
  using (auth.uid() = user_id);

-- Only admins can insert (they create the row on approval)
create policy "Admins create creator profiles"
  on public.creator_profiles for insert
  with check (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and is_admin = true
    )
  );

-- ─────────────────────────────────────────
-- PROGRAMS
-- ─────────────────────────────────────────

create table if not exists public.programs (
  id               uuid primary key default gen_random_uuid(),
  creator_id       uuid references public.creator_profiles(id) on delete cascade not null,
  title            text not null,
  description      text,
  type             text not null default 'standard'
                   check (type in ('standard', 'one_on_one', 'challenge')),
  goal             text check (goal in (
                     'fat_loss', 'muscle_gain', 'maintenance', 'performance', 'general'
                   )),
  duration_weeks   integer not null default 4,
  price_bob        numeric(10,2) not null default 0,
  cover_image_url  text,
  is_published     boolean not null default false,
  is_free          boolean not null default false,
  enrollment_count integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.programs enable row level security;

-- Anyone can browse published programs
create policy "Published programs are public"
  on public.programs for select
  using (is_published = true or
    exists (
      select 1 from public.creator_profiles
      where id = programs.creator_id and user_id = auth.uid()
    )
  );

-- Creator manages their own programs
create policy "Creator manages own programs"
  on public.programs for insert
  with check (
    exists (
      select 1 from public.creator_profiles
      where id = creator_id and user_id = auth.uid()
    )
  );

create policy "Creator updates own programs"
  on public.programs for update
  using (
    exists (
      select 1 from public.creator_profiles
      where id = programs.creator_id and user_id = auth.uid()
    )
  );

create policy "Creator deletes own programs"
  on public.programs for delete
  using (
    exists (
      select 1 from public.creator_profiles
      where id = programs.creator_id and user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- PROGRAM WEEKS
-- ─────────────────────────────────────────

create table if not exists public.program_weeks (
  id            uuid primary key default gen_random_uuid(),
  program_id    uuid references public.programs(id) on delete cascade not null,
  week_number   integer not null,
  title         text,
  description   text,
  unique (program_id, week_number)
);

alter table public.program_weeks enable row level security;

create policy "Program weeks follow program visibility"
  on public.program_weeks for select
  using (
    exists (
      select 1 from public.programs p
      where p.id = program_id
      and (p.is_published = true or exists (
        select 1 from public.creator_profiles cp
        where cp.id = p.creator_id and cp.user_id = auth.uid()
      ))
    )
  );

create policy "Creator manages program weeks"
  on public.program_weeks for all
  using (
    exists (
      select 1 from public.programs p
      join public.creator_profiles cp on cp.id = p.creator_id
      where p.id = program_id and cp.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- PROGRAM DAYS
-- ─────────────────────────────────────────

create table if not exists public.program_days (
  id          uuid primary key default gen_random_uuid(),
  week_id     uuid references public.program_weeks(id) on delete cascade not null,
  day_number  integer not null check (day_number between 1 and 7),
  title       text,
  rest_day    boolean not null default false,
  unique (week_id, day_number)
);

alter table public.program_days enable row level security;

create policy "Program days follow week visibility"
  on public.program_days for select
  using (
    exists (
      select 1 from public.program_weeks pw
      join public.programs p on p.id = pw.program_id
      where pw.id = week_id
      and (p.is_published = true or exists (
        select 1 from public.creator_profiles cp
        where cp.id = p.creator_id and cp.user_id = auth.uid()
      ))
    )
  );

create policy "Creator manages program days"
  on public.program_days for all
  using (
    exists (
      select 1 from public.program_weeks pw
      join public.programs p on p.id = pw.program_id
      join public.creator_profiles cp on cp.id = p.creator_id
      where pw.id = week_id and cp.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- PROGRAM EXERCISES
-- ─────────────────────────────────────────

create table if not exists public.program_exercises (
  id              uuid primary key default gen_random_uuid(),
  day_id          uuid references public.program_days(id) on delete cascade not null,
  exercise_id     uuid references public.exercises(id),   -- optional link to exercises cache
  exercise_name   text not null,
  sets            integer,
  reps            text,           -- "8-12", "to failure", "30 sec"
  weight_guidance text,           -- "bodyweight", "moderate", "RPE 8"
  rest_seconds    integer,
  notes           text,
  order_index     integer not null default 0
);

alter table public.program_exercises enable row level security;

create policy "Program exercises follow day visibility"
  on public.program_exercises for select
  using (
    exists (
      select 1 from public.program_days pd
      join public.program_weeks pw on pw.id = pd.week_id
      join public.programs p on p.id = pw.program_id
      where pd.id = day_id
      and (p.is_published = true or exists (
        select 1 from public.creator_profiles cp
        where cp.id = p.creator_id and cp.user_id = auth.uid()
      ))
    )
  );

create policy "Creator manages program exercises"
  on public.program_exercises for all
  using (
    exists (
      select 1 from public.program_days pd
      join public.program_weeks pw on pw.id = pd.week_id
      join public.programs p on p.id = pw.program_id
      join public.creator_profiles cp on cp.id = p.creator_id
      where pd.id = day_id and cp.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- PROGRAM NUTRITION  (per day targets)
-- ─────────────────────────────────────────

create table if not exists public.program_nutrition (
  id                 uuid primary key default gen_random_uuid(),
  day_id             uuid references public.program_days(id) on delete cascade not null unique,
  calorie_target     integer,
  protein_g          integer,
  carbs_g            integer,
  fat_g              integer,
  meal_timing_notes  text,
  recommended_recipe_ids uuid[] not null default '{}'
);

alter table public.program_nutrition enable row level security;

create policy "Program nutrition follows day visibility"
  on public.program_nutrition for select
  using (
    exists (
      select 1 from public.program_days pd
      join public.program_weeks pw on pw.id = pd.week_id
      join public.programs p on p.id = pw.program_id
      where pd.id = day_id
      and (p.is_published = true or exists (
        select 1 from public.creator_profiles cp
        where cp.id = p.creator_id and cp.user_id = auth.uid()
      ))
    )
  );

create policy "Creator manages program nutrition"
  on public.program_nutrition for all
  using (
    exists (
      select 1 from public.program_days pd
      join public.program_weeks pw on pw.id = pd.week_id
      join public.programs p on p.id = pw.program_id
      join public.creator_profiles cp on cp.id = p.creator_id
      where pd.id = day_id and cp.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- PROGRAM HABITS
-- ─────────────────────────────────────────

create table if not exists public.program_habits (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid references public.programs(id) on delete cascade not null,
  title       text not null,
  description text,
  frequency   text not null default 'daily'
              check (frequency in ('daily', 'weekly')),
  order_index integer not null default 0
);

alter table public.program_habits enable row level security;

create policy "Program habits follow program visibility"
  on public.program_habits for select
  using (
    exists (
      select 1 from public.programs p
      where p.id = program_id
      and (p.is_published = true or exists (
        select 1 from public.creator_profiles cp
        where cp.id = p.creator_id and cp.user_id = auth.uid()
      ))
    )
  );

create policy "Creator manages program habits"
  on public.program_habits for all
  using (
    exists (
      select 1 from public.programs p
      join public.creator_profiles cp on cp.id = p.creator_id
      where p.id = program_id and cp.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- CLIENT ROSTER
-- Creator assigns members to programs; this drives everything downstream
-- ─────────────────────────────────────────

create table if not exists public.client_roster (
  id                    uuid primary key default gen_random_uuid(),
  creator_id            uuid references public.creator_profiles(id) on delete cascade not null,
  member_user_id        uuid references auth.users not null,
  program_id            uuid references public.programs(id),
  status                text not null default 'active'
                        check (status in ('active', 'paused', 'completed', 'cancelled')),
  current_week          integer not null default 1,
  start_date            date not null default current_date,
  end_date              date,
  payment_amount_bob    numeric(10,2),
  payment_submission_id uuid references public.payment_submissions(id),
  notes                 text,   -- private creator notes about this client
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (creator_id, member_user_id, program_id)
);

alter table public.client_roster enable row level security;

-- Creator sees all their clients
create policy "Creator reads own roster"
  on public.client_roster for select
  using (
    exists (
      select 1 from public.creator_profiles
      where id = creator_id and user_id = auth.uid()
    )
  );

-- Member sees their own rows
create policy "Member reads own roster entries"
  on public.client_roster for select
  using (auth.uid() = member_user_id);

-- Only creator can assign / modify
create policy "Creator manages roster"
  on public.client_roster for all
  using (
    exists (
      select 1 from public.creator_profiles
      where id = creator_id and user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- CREATOR COMMUNITIES  (one per creator)
-- ─────────────────────────────────────────

create table if not exists public.creator_communities (
  id           uuid primary key default gen_random_uuid(),
  creator_id   uuid references public.creator_profiles(id) on delete cascade not null unique,
  name         text not null,
  description  text,
  is_public    boolean not null default false,  -- true = posts visible to non-members
  member_count integer not null default 0,
  post_count   integer not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.creator_communities enable row level security;

-- Anyone can see community metadata (for discovery)
create policy "Communities are discoverable"
  on public.creator_communities for select
  using (true);

-- Creator manages their community
create policy "Creator manages own community"
  on public.creator_communities for all
  using (
    exists (
      select 1 from public.creator_profiles
      where id = creator_id and user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- COMMUNITY POSTS
-- ─────────────────────────────────────────

create table if not exists public.community_posts (
  id             uuid primary key default gen_random_uuid(),
  community_id   uuid references public.creator_communities(id) on delete cascade not null,
  author_user_id uuid references auth.users not null,
  content        text,
  image_urls     text[] not null default '{}',
  video_url      text,   -- YouTube / TikTok / Instagram / Vimeo link
  post_type      text not null default 'text'
                 check (post_type in (
                   'text', 'image', 'video', 'workout_share', 'progress_share'
                 )),
  is_pinned      boolean not null default false,
  like_count     integer not null default 0,
  comment_count  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.community_posts enable row level security;

-- Members and creator can read; public communities are open to all
create policy "Community members read posts"
  on public.community_posts for select
  using (
    -- public community
    exists (
      select 1 from public.creator_communities cc
      where cc.id = community_id and cc.is_public = true
    )
    or
    -- active member
    exists (
      select 1 from public.creator_communities cc
      join public.client_roster cr on cr.creator_id = cc.creator_id
      where cc.id = community_id
        and cr.member_user_id = auth.uid()
        and cr.status = 'active'
    )
    or
    -- the creator
    exists (
      select 1 from public.creator_communities cc
      join public.creator_profiles cp on cp.id = cc.creator_id
      where cc.id = community_id and cp.user_id = auth.uid()
    )
  );

-- Active members and creator can post
create policy "Members can post"
  on public.community_posts for insert
  with check (
    auth.uid() = author_user_id
    and (
      exists (
        select 1 from public.creator_communities cc
        join public.creator_profiles cp on cp.id = cc.creator_id
        where cc.id = community_id and cp.user_id = auth.uid()
      )
      or exists (
        select 1 from public.creator_communities cc
        join public.client_roster cr on cr.creator_id = cc.creator_id
        where cc.id = community_id
          and cr.member_user_id = auth.uid()
          and cr.status = 'active'
      )
    )
  );

-- Author can edit their own post
create policy "Author edits own post"
  on public.community_posts for update
  using (auth.uid() = author_user_id);

-- Author or creator can delete
create policy "Author or creator deletes post"
  on public.community_posts for delete
  using (
    auth.uid() = author_user_id
    or exists (
      select 1 from public.creator_communities cc
      join public.creator_profiles cp on cp.id = cc.creator_id
      where cc.id = community_id and cp.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- COMMUNITY POST LIKES
-- ─────────────────────────────────────────

create table if not exists public.community_post_likes (
  post_id    uuid references public.community_posts(id) on delete cascade not null,
  user_id    uuid references auth.users not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.community_post_likes enable row level security;

create policy "Anyone who can read the post can like it"
  on public.community_post_likes for all
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- COMMUNITY POST COMMENTS
-- ─────────────────────────────────────────

create table if not exists public.community_post_comments (
  id             uuid primary key default gen_random_uuid(),
  post_id        uuid references public.community_posts(id) on delete cascade not null,
  author_user_id uuid references auth.users not null,
  content        text not null,
  created_at     timestamptz not null default now()
);

alter table public.community_post_comments enable row level security;

create policy "Members read comments"
  on public.community_post_comments for select
  using (
    exists (
      select 1 from public.community_posts cp
      join public.creator_communities cc on cc.id = cp.community_id
      where cp.id = post_id
      and (
        cc.is_public = true
        or exists (
          select 1 from public.client_roster cr
          where cr.creator_id = cc.creator_id
            and cr.member_user_id = auth.uid()
            and cr.status = 'active'
        )
        or exists (
          select 1 from public.creator_profiles cpf
          where cpf.id = cc.creator_id and cpf.user_id = auth.uid()
        )
      )
    )
  );

create policy "Members comment"
  on public.community_post_comments for insert
  with check (auth.uid() = author_user_id);

create policy "Author deletes own comment"
  on public.community_post_comments for delete
  using (auth.uid() = author_user_id);

-- ─────────────────────────────────────────
-- RECIPE PACKS  (before creator_recipes — FK dependency)
-- ─────────────────────────────────────────

create table if not exists public.recipe_packs (
  id             uuid primary key default gen_random_uuid(),
  creator_id     uuid references public.creator_profiles(id) on delete cascade not null,
  title          text not null,
  description    text,
  cover_image_url text,
  price_bob      numeric(10,2) not null default 0,
  recipe_count   integer not null default 0,
  created_at     timestamptz not null default now()
);

alter table public.recipe_packs enable row level security;

create policy "Recipe packs are public"
  on public.recipe_packs for select
  using (true);

create policy "Creator manages own recipe packs"
  on public.recipe_packs for all
  using (
    exists (
      select 1 from public.creator_profiles
      where id = creator_id and user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- CREATOR RECIPES
-- ─────────────────────────────────────────

create table if not exists public.creator_recipes (
  id                 uuid primary key default gen_random_uuid(),
  creator_id         uuid references public.creator_profiles(id) on delete cascade not null,
  pack_id            uuid references public.recipe_packs(id) on delete set null,
  title              text not null,
  description        text,
  ingredients        jsonb not null default '[]',   -- [{name, amount, unit}]
  instructions       text[] not null default '{}',
  macros             jsonb,                          -- {calories, protein_g, carbs_g, fat_g}
  image_url          text,
  prep_time_minutes  integer,
  cook_time_minutes  integer,
  servings           integer,
  tags               text[] not null default '{}',
  access_level       text not null default 'community'
                     check (access_level in ('free', 'community', 'pack')),
  created_at         timestamptz not null default now()
);

alter table public.creator_recipes enable row level security;

-- Free recipes visible to all; community = active member; pack = purchaser (handled app-side for now)
create policy "Creator recipes visibility"
  on public.creator_recipes for select
  using (
    access_level = 'free'
    or exists (
      select 1 from public.creator_profiles
      where id = creator_id and user_id = auth.uid()
    )
    or (
      access_level = 'community'
      and exists (
        select 1 from public.client_roster
        where creator_id = creator_recipes.creator_id
          and member_user_id = auth.uid()
          and status = 'active'
      )
    )
  );

create policy "Creator manages own recipes"
  on public.creator_recipes for all
  using (
    exists (
      select 1 from public.creator_profiles
      where id = creator_id and user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- AUTOMATED CHECK-INS
-- ─────────────────────────────────────────

create table if not exists public.automated_checkins (
  id                 uuid primary key default gen_random_uuid(),
  creator_id         uuid references public.creator_profiles(id) on delete cascade not null,
  program_id         uuid references public.programs(id) on delete cascade,
  title              text not null,
  questions          jsonb not null default '[]',
  -- [{id, question, type: 'text'|'number'|'photo'|'scale_1_10'}]
  frequency          text not null default 'weekly'
                     check (frequency in ('daily', 'weekly', 'biweekly', 'monthly')),
  send_day_of_week   integer check (send_day_of_week between 0 and 6),   -- 0 = Sunday
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

alter table public.automated_checkins enable row level security;

create policy "Creator manages check-ins"
  on public.automated_checkins for all
  using (
    exists (
      select 1 from public.creator_profiles
      where id = creator_id and user_id = auth.uid()
    )
  );

-- Members see check-ins assigned to them (via program)
create policy "Members see their check-ins"
  on public.automated_checkins for select
  using (
    exists (
      select 1 from public.client_roster
      where creator_id = automated_checkins.creator_id
        and member_user_id = auth.uid()
        and status = 'active'
        and (automated_checkins.program_id is null
             or program_id = automated_checkins.program_id)
    )
  );

-- ─────────────────────────────────────────
-- CHECK-IN RESPONSES
-- ─────────────────────────────────────────

create table if not exists public.checkin_responses (
  id              uuid primary key default gen_random_uuid(),
  checkin_id      uuid references public.automated_checkins(id) on delete cascade not null,
  member_user_id  uuid references auth.users not null,
  responses       jsonb not null default '{}',   -- {question_id: answer}
  submitted_at    timestamptz not null default now()
);

alter table public.checkin_responses enable row level security;

-- Member submits and reads their own responses
create policy "Member manages own responses"
  on public.checkin_responses for all
  using (auth.uid() = member_user_id);

-- Creator reads all responses for their check-ins
create policy "Creator reads client responses"
  on public.checkin_responses for select
  using (
    exists (
      select 1 from public.automated_checkins ac
      join public.creator_profiles cp on cp.id = ac.creator_id
      where ac.id = checkin_id and cp.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────

create index if not exists creator_profiles_slug_idx on public.creator_profiles (slug);
create index if not exists creator_profiles_country_idx on public.creator_profiles (country);
create index if not exists creator_profiles_specialty_idx on public.creator_profiles using gin (specialty);
create index if not exists programs_creator_idx on public.programs (creator_id);
create index if not exists programs_published_idx on public.programs (is_published) where is_published = true;
create index if not exists client_roster_creator_idx on public.client_roster (creator_id);
create index if not exists client_roster_member_idx on public.client_roster (member_user_id);
create index if not exists community_posts_community_idx on public.community_posts (community_id, created_at desc);
create index if not exists creator_recipes_creator_idx on public.creator_recipes (creator_id);

-- ─────────────────────────────────────────
-- STORAGE BUCKET — creator media
-- Public bucket: avatars, cover photos, community post images
-- ─────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('creator-media', 'creator-media', true)
on conflict (id) do nothing;

-- Creators upload to their own folder: creator-media/{user_id}/...
create policy "Creators upload own media"
  on storage.objects for insert
  with check (
    bucket_id = 'creator-media'
    and auth.uid()::text = (storage.foldername(name))[1]
    and exists (
      select 1 from public.profiles
      where user_id = auth.uid() and is_creator = true
    )
  );

create policy "Creators update own media"
  on storage.objects for update
  using (
    bucket_id = 'creator-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Anyone reads creator media"
  on storage.objects for select
  using (bucket_id = 'creator-media');
