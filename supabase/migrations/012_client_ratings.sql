-- Client ratings for creators
-- One rating per roster entry; triggers keep avg_client_rating in sync.

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

-- Member can insert/update/delete their own rating
create policy "member_manage_rating" on public.creator_ratings
  for all
  using  (auth.uid() = member_user_id)
  with check (auth.uid() = member_user_id);

-- Ratings are publicly readable (shows on creator profile page)
create policy "ratings_public_read" on public.creator_ratings
  for select using (true);

-- ── Trigger: keep creator_profiles.avg_client_rating in sync ───────────────
create or replace function public.sync_creator_avg_rating()
returns trigger language plpgsql security definer as $$
declare
  target_creator_id uuid;
begin
  target_creator_id := coalesce(new.creator_id, old.creator_id);

  update public.creator_profiles
  set avg_client_rating = (
    select round(avg(rating)::numeric, 1)
    from public.creator_ratings
    where creator_id = target_creator_id
  )
  where id = target_creator_id;

  return coalesce(new, old);
end;
$$;

create trigger trg_sync_creator_avg_rating
after insert or update or delete on public.creator_ratings
for each row execute function public.sync_creator_avg_rating();

-- Index for creator profile page query
create index if not exists creator_ratings_creator_idx
  on public.creator_ratings (creator_id, created_at desc);
