-- ── Fix: Creator can pin/unpin community posts ───────────────────────────────
-- The only UPDATE policy on community_posts was "Author edits own post"
-- (auth.uid() = author_user_id). This meant togglePin() — called from the
-- creator's studio to pin a MEMBER's post — silently affected zero rows
-- whenever the creator wasn't the post's author: Postgres RLS filters the
-- row out before the UPDATE runs, and a zero-row UPDATE is not an error, so
-- the action returned { ok: true } while doing nothing.
--
-- This adds a second permissive UPDATE policy scoped to the creator of the
-- post's community. RLS is row-level, not column-level — the broadened row
-- access is safe here because the only caller is togglePin() in
-- src/lib/community/actions.ts, which never sets anything but is_pinned.
create policy "Creator pins posts in own community"
  on public.community_posts for update
  using (
    exists (
      select 1 from public.creator_communities cc
      join public.creator_profiles cp on cp.id = cc.creator_id
      where cc.id = community_posts.community_id and cp.user_id = auth.uid()
    )
  );
