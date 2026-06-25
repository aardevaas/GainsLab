-- Notification center
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

create index notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;

alter table public.notifications enable row level security;

-- Users can read their own notifications
create policy "users_read_own_notifications" on public.notifications
  for select using (auth.uid() = user_id);

-- Any authenticated user may insert a notification (server actions control the content)
create policy "authenticated_insert_notifications" on public.notifications
  for insert with check (auth.role() = 'authenticated');

-- Users can update (mark read) their own notifications
create policy "users_update_own_notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- Enable realtime so the bell badge refreshes without polling
alter publication supabase_realtime add table public.notifications;
