-- Auto-maintain total_clients and total_transformations on creator_profiles.
-- Without these, counters stay at 0 even when clients are approved / complete.

-- ── total_clients: count of active client_roster rows per creator ───────────

create or replace function public.sync_creator_total_clients()
returns trigger language plpgsql security definer as $$
declare
  target_creator_id uuid;
begin
  target_creator_id := coalesce(
    case when TG_OP = 'DELETE' then old.creator_id else new.creator_id end,
    old.creator_id
  );

  update public.creator_profiles
  set total_clients = (
    select count(*)::integer
    from public.client_roster
    where creator_id = target_creator_id
      and status = 'active'
  )
  where id = target_creator_id;

  return coalesce(new, old);
end;
$$;

-- Fire after any insert, delete, or status change
create trigger trg_sync_total_clients
after insert or update of status or delete on public.client_roster
for each row execute function public.sync_creator_total_clients();

-- ── total_transformations: increment once when status → 'completed' ─────────

create or replace function public.sync_creator_total_transformations()
returns trigger language plpgsql security definer as $$
begin
  if old.status is distinct from 'completed' and new.status = 'completed' then
    update public.creator_profiles
    set total_transformations = total_transformations + 1
    where id = new.creator_id;
  end if;
  return new;
end;
$$;

create trigger trg_sync_total_transformations
after update of status on public.client_roster
for each row execute function public.sync_creator_total_transformations();

-- ── Backfill existing data ───────────────────────────────────────────────────
-- Correct any stale counts after migration runs.

update public.creator_profiles cp
set total_clients = (
  select count(*)::integer
  from public.client_roster cr
  where cr.creator_id = cp.id and cr.status = 'active'
);

update public.creator_profiles cp
set total_transformations = (
  select count(*)::integer
  from public.client_roster cr
  where cr.creator_id = cp.id and cr.status = 'completed'
);
