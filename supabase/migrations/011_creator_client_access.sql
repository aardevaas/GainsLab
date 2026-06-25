-- Allow creators to read their active clients' personal tracker data.
-- Without these policies the client detail page returns empty rows for
-- body_measurements, workout_sessions, sleep_logs, and program_day_completions
-- even though the creator is the legitimate viewer.

-- Helper: is the queried user_id an active client of the requesting creator?
-- Used as a sub-select in each policy.

-- ── body_measurements ──────────────────────────────────────────────────────
create policy "creator_reads_client_measurements"
  on public.body_measurements for select
  using (
    exists (
      select 1 from public.client_roster cr
      join public.creator_profiles cp on cp.id = cr.creator_id
      where cr.member_user_id = body_measurements.user_id
        and cp.user_id = auth.uid()
        and cr.status = 'active'
    )
  );

-- ── workout_sessions ───────────────────────────────────────────────────────
create policy "creator_reads_client_sessions"
  on public.workout_sessions for select
  using (
    exists (
      select 1 from public.client_roster cr
      join public.creator_profiles cp on cp.id = cr.creator_id
      where cr.member_user_id = workout_sessions.user_id
        and cp.user_id = auth.uid()
        and cr.status = 'active'
    )
  );

-- ── sleep_logs ─────────────────────────────────────────────────────────────
create policy "creator_reads_client_sleep"
  on public.sleep_logs for select
  using (
    exists (
      select 1 from public.client_roster cr
      join public.creator_profiles cp on cp.id = cr.creator_id
      where cr.member_user_id = sleep_logs.user_id
        and cp.user_id = auth.uid()
        and cr.status = 'active'
    )
  );

-- ── program_day_completions ────────────────────────────────────────────────
create policy "creator_reads_client_completions"
  on public.program_day_completions for select
  using (
    exists (
      select 1 from public.client_roster cr
      join public.creator_profiles cp on cp.id = cr.creator_id
      where cr.member_user_id = program_day_completions.user_id
        and cp.user_id = auth.uid()
        and cr.status = 'active'
    )
  );
