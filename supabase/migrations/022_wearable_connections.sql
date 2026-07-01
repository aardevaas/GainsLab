-- ─────────────────────────────────────────
-- WEARABLE CONNECTIONS (shell)
-- Landing page promises Google Fit / Fitbit / Oura sync as a Pro feature.
-- No OAuth flow exists yet for any provider — this table is the storage
-- shape a real integration will write into once API credentials exist for
-- a given provider, so wiring one up later is additive, not a schema change.
-- ─────────────────────────────────────────

create table if not exists public.wearable_connections (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  provider          text not null check (provider in ('google_fit', 'fitbit', 'oura')),
  status            text not null default 'disconnected'
                    check (status in ('disconnected', 'connected', 'error')),
  access_token      text,
  refresh_token     text,
  token_expires_at  timestamptz,
  last_synced_at    timestamptz,
  last_error        text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id, provider)
);

alter table public.wearable_connections enable row level security;

create policy "Users manage own wearable connections"
  on public.wearable_connections for all
  using (auth.uid() = user_id);

create trigger set_wearable_connections_updated_at
  before update on public.wearable_connections
  for each row execute procedure public.set_updated_at();
