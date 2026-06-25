-- Add is_accepting_clients flag to creator_profiles
alter table public.creator_profiles
  add column if not exists is_accepting_clients boolean not null default true;

comment on column public.creator_profiles.is_accepting_clients is
  'When false, the public creator page hides the join request button and requestToJoin is blocked.';
