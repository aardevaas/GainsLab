-- ══════════════════════════════════════════════════════════════════════
-- GainsLab — Safe Repair / Verification Script (migration 017)
-- Run this once in Supabase SQL Editor.
-- Every statement is idempotent (safe to run multiple times).
-- Covers any partial failures from migrations 007–016.
-- ══════════════════════════════════════════════════════════════════════

-- ── 007: messages ─────────────────────────────────────────────────────
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  roster_id  uuid references public.client_roster on delete cascade not null,
  sender_id  uuid references auth.users not null,
  body       text not null check (char_length(body) > 0 and char_length(body) <= 4000),
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists messages_roster_created_idx
  on public.messages (roster_id, created_at desc);
alter table public.messages enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='messages' and policyname='creator_messages_select') then
    create policy "creator_messages_select" on public.messages for select using (
      exists (select 1 from public.client_roster cr join public.creator_profiles cp on cp.id = cr.creator_id where cr.id = messages.roster_id and cp.user_id = auth.uid())
    ); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='messages' and policyname='creator_messages_insert') then
    create policy "creator_messages_insert" on public.messages for insert with check (
      sender_id = auth.uid() and exists (select 1 from public.client_roster cr join public.creator_profiles cp on cp.id = cr.creator_id where cr.id = messages.roster_id and cp.user_id = auth.uid())
    ); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='messages' and policyname='creator_messages_update') then
    create policy "creator_messages_update" on public.messages for update using (
      exists (select 1 from public.client_roster cr join public.creator_profiles cp on cp.id = cr.creator_id where cr.id = messages.roster_id and cp.user_id = auth.uid())
    ); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='messages' and policyname='member_messages_select') then
    create policy "member_messages_select" on public.messages for select using (
      exists (select 1 from public.client_roster cr where cr.id = messages.roster_id and cr.member_user_id = auth.uid())
    ); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='messages' and policyname='member_messages_insert') then
    create policy "member_messages_insert" on public.messages for insert with check (
      sender_id = auth.uid() and exists (select 1 from public.client_roster cr where cr.id = messages.roster_id and cr.member_user_id = auth.uid())
    ); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='messages' and policyname='member_messages_update') then
    create policy "member_messages_update" on public.messages for update using (
      exists (select 1 from public.client_roster cr where cr.id = messages.roster_id and cr.member_user_id = auth.uid())
    ); end if; end $$;

-- Add to realtime (safe — ignore if already present)
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;


-- ── 008: notifications ─────────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  type       text not null,
  title      text not null,
  body       text,
  href       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications (user_id) where read_at is null;
alter table public.notifications enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='notifications' and policyname='users_read_own_notifications') then
    create policy "users_read_own_notifications" on public.notifications for select using (auth.uid() = user_id);
  end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='notifications' and policyname='users_update_own_notifications') then
    create policy "users_update_own_notifications" on public.notifications for update using (auth.uid() = user_id);
  end if; end $$;
-- Drop the insecure open insert policy if it still exists (migration 016 fix)
drop policy if exists "authenticated_insert_notifications" on public.notifications;

do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; end $$;


-- ── 009: is_accepting_clients ──────────────────────────────────────────
alter table public.creator_profiles
  add column if not exists is_accepting_clients boolean not null default true;


-- ── 010: program_day_completions ───────────────────────────────────────
create table if not exists public.program_day_completions (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  day_id       uuid        not null references public.program_days(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, day_id)
);
alter table public.program_day_completions enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='program_day_completions' and policyname='users_manage_own_completions') then
    create policy "users_manage_own_completions" on public.program_day_completions
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if; end $$;


-- ── 011: creator reads client data ────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where tablename='body_measurements' and policyname='creator_reads_client_measurements') then
    create policy "creator_reads_client_measurements" on public.body_measurements for select using (
      exists (select 1 from public.client_roster cr join public.creator_profiles cp on cp.id = cr.creator_id
        where cr.member_user_id = body_measurements.user_id and cp.user_id = auth.uid() and cr.status = 'active')
    ); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='workout_sessions' and policyname='creator_reads_client_sessions') then
    create policy "creator_reads_client_sessions" on public.workout_sessions for select using (
      exists (select 1 from public.client_roster cr join public.creator_profiles cp on cp.id = cr.creator_id
        where cr.member_user_id = workout_sessions.user_id and cp.user_id = auth.uid() and cr.status = 'active')
    ); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='sleep_logs' and policyname='creator_reads_client_sleep') then
    create policy "creator_reads_client_sleep" on public.sleep_logs for select using (
      exists (select 1 from public.client_roster cr join public.creator_profiles cp on cp.id = cr.creator_id
        where cr.member_user_id = sleep_logs.user_id and cp.user_id = auth.uid() and cr.status = 'active')
    ); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='program_day_completions' and policyname='creator_reads_client_completions') then
    create policy "creator_reads_client_completions" on public.program_day_completions for select using (
      exists (select 1 from public.client_roster cr join public.creator_profiles cp on cp.id = cr.creator_id
        where cr.member_user_id = program_day_completions.user_id and cp.user_id = auth.uid() and cr.status = 'active')
    ); end if; end $$;


-- ── 012: creator_ratings ──────────────────────────────────────────────
create table if not exists public.creator_ratings (
  id             uuid        primary key default gen_random_uuid(),
  roster_id      uuid        unique not null references public.client_roster(id) on delete cascade,
  creator_id     uuid        not null references public.creator_profiles(id) on delete cascade,
  member_user_id uuid        not null references auth.users(id) on delete cascade,
  rating         integer     not null check (rating between 1 and 5),
  review_text    text        check (char_length(review_text) <= 400),
  created_at     timestamptz not null default now()
);
alter table public.creator_ratings enable row level security;

-- Secure version from migration 016 (roster ownership check)
drop policy if exists "member_manage_rating" on public.creator_ratings;
create policy "member_manage_rating" on public.creator_ratings
  for all
  using  (auth.uid() = member_user_id)
  with check (
    auth.uid() = member_user_id
    and exists (
      select 1 from public.client_roster cr
      where cr.id = creator_ratings.roster_id
        and cr.member_user_id = auth.uid()
    )
  );

do $$ begin
  if not exists (select 1 from pg_policies where tablename='creator_ratings' and policyname='ratings_public_read') then
    create policy "ratings_public_read" on public.creator_ratings for select using (true);
  end if; end $$;

create index if not exists creator_ratings_creator_idx
  on public.creator_ratings (creator_id, created_at desc);


-- ── 012: avg rating trigger ───────────────────────────────────────────
create or replace function public.sync_creator_avg_rating()
returns trigger language plpgsql security definer as $$
declare target_creator_id uuid;
begin
  target_creator_id := coalesce(new.creator_id, old.creator_id);
  update public.creator_profiles
  set avg_client_rating = (
    select round(avg(rating)::numeric, 1) from public.creator_ratings where creator_id = target_creator_id
  ) where id = target_creator_id;
  return coalesce(new, old);
end;
$$;
drop trigger if exists trg_sync_creator_avg_rating on public.creator_ratings;
create trigger trg_sync_creator_avg_rating
  after insert or update or delete on public.creator_ratings
  for each row execute function public.sync_creator_avg_rating();


-- ── 013: total_clients + total_transformations triggers ───────────────
create or replace function public.sync_creator_total_clients()
returns trigger language plpgsql security definer as $$
declare target_creator_id uuid;
begin
  target_creator_id := coalesce(
    case when TG_OP = 'DELETE' then old.creator_id else new.creator_id end,
    old.creator_id
  );
  update public.creator_profiles
  set total_clients = (
    select count(*)::integer from public.client_roster where creator_id = target_creator_id and status = 'active'
  ) where id = target_creator_id;
  return coalesce(new, old);
end;
$$;
drop trigger if exists trg_sync_total_clients on public.client_roster;
create trigger trg_sync_total_clients
  after insert or update of status or delete on public.client_roster
  for each row execute function public.sync_creator_total_clients();

create or replace function public.sync_creator_total_transformations()
returns trigger language plpgsql security definer as $$
begin
  if old.status is distinct from 'completed' and new.status = 'completed' then
    update public.creator_profiles set total_transformations = total_transformations + 1 where id = new.creator_id;
  end if;
  return new;
end;
$$;
drop trigger if exists trg_sync_total_transformations on public.client_roster;
create trigger trg_sync_total_transformations
  after update of status on public.client_roster
  for each row execute function public.sync_creator_total_transformations();

-- Backfill counters
update public.creator_profiles cp
  set total_clients = (select count(*)::integer from public.client_roster cr where cr.creator_id = cp.id and cr.status = 'active');
update public.creator_profiles cp
  set total_transformations = (select count(*)::integer from public.client_roster cr where cr.creator_id = cp.id and cr.status = 'completed');


-- ── 014 + 015: storage buckets ────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('creator-avatars', 'creator-avatars', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-avatars', 'user-avatars', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='creator_upload_avatar') then
    create policy "creator_upload_avatar" on storage.objects for insert with check (
      bucket_id = 'creator-avatars' and auth.uid()::text = (storage.foldername(name))[1]
    ); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='creator_avatar_public_read') then
    create policy "creator_avatar_public_read" on storage.objects for select using (bucket_id = 'creator-avatars');
  end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='creator_delete_avatar') then
    create policy "creator_delete_avatar" on storage.objects for delete using (
      bucket_id = 'creator-avatars' and auth.uid()::text = (storage.foldername(name))[1]
    ); end if; end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='user_upload_avatar') then
    create policy "user_upload_avatar" on storage.objects for insert with check (
      bucket_id = 'user-avatars' and auth.uid()::text = (storage.foldername(name))[1]
    ); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='user_avatar_public_read') then
    create policy "user_avatar_public_read" on storage.objects for select using (bucket_id = 'user-avatars');
  end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='user_delete_avatar') then
    create policy "user_delete_avatar" on storage.objects for delete using (
      bucket_id = 'user-avatars' and auth.uid()::text = (storage.foldername(name))[1]
    ); end if; end $$;


-- ── Admin + creator backfill ──────────────────────────────────────────
update public.profiles
  set is_admin = true
  where user_id = (select id from auth.users where email = 'alesaavedrau.asu@gmail.com');

update public.creator_profiles cp
  set is_verified = true
  where exists (
    select 1 from public.creator_applications ca
    where ca.user_id = cp.user_id and ca.status = 'approved'
  );


-- ── Verification — confirms what got applied ──────────────────────────
select
  (select count(*) from public.messages)                as messages_rows,
  (select count(*) from public.notifications)           as notification_rows,
  (select count(*) from public.program_day_completions) as completions_rows,
  (select count(*) from public.creator_ratings)         as ratings_rows,
  (select count(*) from storage.buckets where id in ('creator-avatars','user-avatars')) as avatar_buckets,
  (select is_admin from public.profiles where user_id = (select id from auth.users where email = 'alesaavedrau.asu@gmail.com')) as you_are_admin;
