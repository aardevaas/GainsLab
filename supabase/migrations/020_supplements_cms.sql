-- ─────────────────────────────────────────
-- SUPPLEMENTS DATABASE
-- Replaces the hardcoded src/lib/supplements/data.ts array with an
-- admin-editable table, same shape as 019_education_cms.sql.
-- ─────────────────────────────────────────

create table if not exists public.supplements (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  category        text not null,
  goals           text[] not null default '{}'
                  -- subset check enforced at the app layer (SupplementGoal union);
                  -- a check constraint on array elements isn't worth the complexity here.
  ,
  evidence        text not null check (evidence in ('A', 'B', 'C', 'D')),
  summary         text not null,
  mechanism       text not null,
  dosage          text not null,
  timing          text not null,
  notes           text,
  price_tier      text not null check (price_tier in ('budget', 'moderate', 'premium')),
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_supplements_published on public.supplements(is_published);

alter table public.supplements enable row level security;

create policy "Published supplements are public"
  on public.supplements for select
  using (is_published = true);

create policy "Admins manage supplements"
  on public.supplements for all
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and is_admin = true
    )
  );

create trigger set_supplements_updated_at
  before update on public.supplements
  for each row execute procedure public.set_updated_at();
