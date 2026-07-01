-- ─────────────────────────────────────────
-- EDUCATION HUB CMS
-- Replaces the hardcoded src/lib/learn/articles.ts array with
-- admin-editable, TipTap-authored articles.
-- ─────────────────────────────────────────

create table if not exists public.education_articles (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  category        text not null
                  check (category in ('Nutrition', 'Training', 'Recovery', 'Body Composition', 'Myths')),
  summary         text not null,
  reading_time    integer not null default 5 check (reading_time > 0),
  key_takeaways   text[] not null default '{}',
  -- TipTap/ProseMirror document JSON — rendered read-only client-side via
  -- @tiptap/react so we never need dangerouslySetInnerHTML for article body.
  content         jsonb not null default '{"type":"doc","content":[]}',
  sources         text[] not null default '{}',
  is_published    boolean not null default false,
  author_user_id  uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_education_articles_published
  on public.education_articles(is_published, category);

alter table public.education_articles enable row level security;

create policy "Published articles are public"
  on public.education_articles for select
  using (is_published = true);

create policy "Admins manage articles"
  on public.education_articles for all
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and is_admin = true
    )
  );

create trigger set_education_articles_updated_at
  before update on public.education_articles
  for each row execute procedure public.set_updated_at();
