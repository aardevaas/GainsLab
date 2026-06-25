-- Track which program days a member has completed
create table if not exists public.program_day_completions (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  day_id       uuid        not null references public.program_days(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, day_id)
);

alter table public.program_day_completions enable row level security;

-- Members can read, insert, and delete only their own completions
create policy "users_manage_own_completions" on public.program_day_completions
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on table public.program_day_completions is
  'Tracks per-member day-level completion for assigned programs.';
