-- ============================================================
-- 007: Direct messages between creator and client
-- ============================================================

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

-- Creator: full access to threads on their rosters
create policy "creator_messages_select" on public.messages
  for select using (
    exists (
      select 1 from public.client_roster cr
      join public.creator_profiles cp on cp.id = cr.creator_id
      where cr.id = messages.roster_id
        and cp.user_id = auth.uid()
    )
  );

create policy "creator_messages_insert" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.client_roster cr
      join public.creator_profiles cp on cp.id = cr.creator_id
      where cr.id = messages.roster_id
        and cp.user_id = auth.uid()
    )
  );

create policy "creator_messages_update" on public.messages
  for update using (
    exists (
      select 1 from public.client_roster cr
      join public.creator_profiles cp on cp.id = cr.creator_id
      where cr.id = messages.roster_id
        and cp.user_id = auth.uid()
    )
  );

-- Member: access to their own roster threads only
create policy "member_messages_select" on public.messages
  for select using (
    exists (
      select 1 from public.client_roster cr
      where cr.id = messages.roster_id
        and cr.member_user_id = auth.uid()
    )
  );

create policy "member_messages_insert" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.client_roster cr
      where cr.id = messages.roster_id
        and cr.member_user_id = auth.uid()
    )
  );

create policy "member_messages_update" on public.messages
  for update using (
    exists (
      select 1 from public.client_roster cr
      where cr.id = messages.roster_id
        and cr.member_user_id = auth.uid()
    )
  );

-- Enable Realtime for live message delivery
alter publication supabase_realtime add table public.messages;
