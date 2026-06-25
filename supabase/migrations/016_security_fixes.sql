-- ── Security Fix 1: Notification insert ──────────────────────────────────────
-- The original policy allowed any authenticated user to insert a notification
-- for any other user by calling the Supabase API directly. Notifications are
-- now inserted exclusively via the service-role client in server actions, so
-- no client-level insert policy is required.
drop policy if exists "authenticated_insert_notifications" on public.notifications;

-- ── Security Fix 2: Creator ratings roster-ownership check ───────────────────
-- The original with check only verified member_user_id = auth.uid(), which
-- allowed an attacker to supply a roster_id belonging to a different member.
-- The new policy additionally confirms the roster entry belongs to the caller.
drop policy if exists "member_manage_rating" on public.creator_ratings;

create policy "member_manage_rating" on public.creator_ratings
  for all
  using  (auth.uid() = member_user_id)
  with check (
    auth.uid() = member_user_id
    and exists (
      select 1 from public.client_roster cr
      where cr.id = creator_ratings.roster_id
        and cr.member_user_id = auth.uid()
    )
  );
