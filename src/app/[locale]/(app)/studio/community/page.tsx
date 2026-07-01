import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StudioCommunityClient } from './StudioCommunityClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Community — Studio' };

export default async function StudioCommunityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('id, display_name, slug')
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect('/studio');

  // Auto-create community if it doesn't exist
  let { data: community } = await supabase
    .from('creator_communities')
    .select('id, name, description, post_count')
    .eq('creator_id', profile.id)
    .maybeSingle();

  if (!community) {
    const { data: created } = await supabase
      .from('creator_communities')
      .insert({
        creator_id: profile.id,
        name: `${profile.display_name}'s Community`,
        description: null,
      })
      .select('id, name, description, post_count')
      .single();
    community = created;
  }

  if (!community) redirect('/studio');

  // Load posts (pinned first, then newest)
  const { data: posts } = await supabase
    .from('community_posts')
    .select('id, community_id, author_user_id, content, video_url, post_type, is_pinned, like_count, comment_count, created_at')
    .eq('community_id', community.id)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  const postList = posts ?? [];

  // Author profiles
  const authorIds = [...new Set(postList.map(p => p.author_user_id))];
  const { data: authorProfiles } = authorIds.length > 0
    ? await supabase.from('profiles').select('user_id, name, username').in('user_id', authorIds)
    : { data: [] };

  const nameMap: Record<string, string> = {};
  for (const p of authorProfiles ?? []) {
    nameMap[p.user_id] = p.name ?? p.username ?? 'Member';
  }

  // My likes
  const postIds = postList.map(p => p.id);
  const { data: myLikes } = postIds.length > 0
    ? await supabase
        .from('community_post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)
    : { data: [] };
  const likedSet = new Set((myLikes ?? []).map(l => l.post_id));

  // Comments
  const { data: allComments } = postIds.length > 0
    ? await supabase
        .from('community_post_comments')
        .select('id, post_id, author_user_id, content, created_at')
        .in('post_id', postIds)
        .order('created_at', { ascending: true })
    : { data: [] };

  const commentAuthorIds = [...new Set((allComments ?? []).map(c => c.author_user_id))];
  const { data: commentProfiles } = commentAuthorIds.length > 0
    ? await supabase.from('profiles').select('user_id, name, username').in('user_id', commentAuthorIds)
    : { data: [] };
  for (const p of commentProfiles ?? []) {
    nameMap[p.user_id] = nameMap[p.user_id] ?? p.name ?? p.username ?? 'Member';
  }

  const commentsByPost: Record<string, typeof allComments> = {};
  for (const c of allComments ?? []) {
    (commentsByPost[c.post_id] ??= []).push(c);
  }

  const enrichedPosts = postList.map(p => ({
    ...p,
    authorName: nameMap[p.author_user_id] ?? 'Member',
    isLikedByMe: likedSet.has(p.id),
    comments: (commentsByPost[p.id] ?? []).map(c => ({
      ...c,
      authorName: nameMap[c.author_user_id] ?? 'Member',
    })),
  }));

  return (
    <div style={{ padding: '32px 28px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 20, fontWeight: 800, color: 'var(--color-text)',
          margin: '0 0 4px', letterSpacing: '-0.03em',
        }}>
          {community.name}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
          {community.post_count} post{community.post_count !== 1 ? 's' : ''}
        </p>
      </div>

      <StudioCommunityClient
        community={community}
        posts={enrichedPosts}
        currentUserId={user.id}
        slug={profile.slug}
      />
    </div>
  );
}
