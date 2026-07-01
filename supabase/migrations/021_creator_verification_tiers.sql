-- ─────────────────────────────────────────
-- CREATOR VERIFICATION TIERS
-- The landing page has always promised a "Verified → Pro Creator → Elite
-- Creator" progression, but creator_profiles only ever had a single
-- is_verified boolean set once at application approval. This adds the
-- actual tier the copy describes. is_verified is kept (existing code reads
-- it for discoverability gating) and derived from the tier at every write
-- site in the app rather than via a trigger — there's exactly one place
-- (admin actions) that ever writes either column.
-- ─────────────────────────────────────────

alter table public.creator_profiles
  add column if not exists verification_tier text not null default 'none'
    check (verification_tier in ('none', 'verified', 'pro', 'elite'));

-- Backfill: every creator approved under the old boolean-only system starts
-- at the base "verified" tier rather than being demoted to "none".
update public.creator_profiles
  set verification_tier = 'verified'
  where is_verified = true and verification_tier = 'none';
