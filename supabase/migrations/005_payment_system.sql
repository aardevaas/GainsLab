-- ============================================================
-- 005: Payment system — subscriptions, receipt submissions,
--      verified TX IDs, admin flag, receipt storage bucket
-- ============================================================

-- Subscriptions (one row per user, upserted on approval)
create table if not exists public.subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users not null,
  plan_id      text not null default 'pro',
  status       text not null default 'inactive', -- active | inactive | expired
  started_at   timestamptz,
  expires_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint subscriptions_user_id_key unique (user_id)
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Payment submissions (receipt uploads)
create table if not exists public.payment_submissions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references auth.users not null,
  receipt_storage_path     text not null,
  plan_id                  text not null default 'pro',
  status                   text not null default 'pending', -- pending | approved | rejected | flagged
  amount_extracted         numeric,
  transaction_id_extracted text,
  date_extracted           text,
  destination_extracted    text,
  ocr_raw                  jsonb,
  ocr_confidence           text,
  auto_approved            boolean default false,
  reviewed_by              uuid references auth.users,
  review_note              text,
  submitted_at             timestamptz not null default now(),
  reviewed_at              timestamptz
);

alter table public.payment_submissions enable row level security;

create policy "Users can view own submissions"
  on public.payment_submissions for select
  using (auth.uid() = user_id);

create policy "Users can insert own submissions"
  on public.payment_submissions for insert
  with check (auth.uid() = user_id);

-- Verified transaction IDs — prevents the same receipt being used twice
create table if not exists public.verified_tx_ids (
  transaction_id text primary key,
  submission_id  uuid references public.payment_submissions not null,
  user_id        uuid references auth.users not null,
  created_at     timestamptz not null default now()
);

alter table public.verified_tx_ids enable row level security;

-- Admin flag on profiles
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Storage bucket for payment receipts (private — only accessible via signed URLs)
insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', false)
on conflict (id) do nothing;

-- Users can upload to their own folder: payment-receipts/{user_id}/...
create policy "Users upload own receipts"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-receipts' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users read own receipts"
  on storage.objects for select
  using (
    bucket_id = 'payment-receipts' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
