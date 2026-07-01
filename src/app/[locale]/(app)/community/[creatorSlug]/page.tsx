import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { MemberCommunityClient } from './MemberCommunityClient';
import type { Metadata } from 'next';

export async function generateMetadata(
  { params }: { params: Promise<{ creatorSlug: string }> }
): Promise<Metadata> {
  const { creatorSlug } = await params;
  return { title: `${creatorSlug} Community` };
}

export default async function CreatorCommunityPage(
  { params }: { params: Promise<{ creatorSlug: string }> }
) {
  const { creatorSlug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Find creator by slug
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id, display_name, slug')
    .eq('slug', creatorSlug)
    .single();

  if (!creator) redirect('/community');

  // Find community
  const { data: community } = await supabase
    .from('creator_communities')
    .select('id, name, description, post_count, is_public')
    .eq('creator_id', creator.id)
    .maybeSingle();

  // Check if current user is active member of this creator
  const { data: roster } = await supabase
    .from('client_roster')
    .select('id')
    .eq('creator_id', creator.id)
    .eq('member_user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  // Check if current user is the creator
  const { data: ownProfile } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_id', user.id)
    .eq('id', creator.id)
    .maybeSingle();

  const isMember = !!roster;
  const isCreator = !!ownProfile;
  const isPublic = community?.is_public === true;

  if (!isMember && !isCreator && !isPublic) {
    // Not a member of a private community — show locked state
    return (
      <div style={{ padding: '40px 28px' }}>
        <Link href="/community" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)',
          textDecoration: 'none', marginBottom: 32,
        }}>
          <ArrowLeft size={13} /> Community
        </Link>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          padding: '60px 24px', textAlign: 'center',
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            {community?.name ?? `${creator.display_name}'s Community`}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 380, lineHeight: 1.7 }}>
            You need to be an active client of {creator.display_name} to see this community.
          </p>
          <Link href={`/creator/${creatorSlug}`} style={{
            padding: '9px 22px', borderRadius: 10, textDecoration: 'none',
            background: 'rgba(96,165,250,0.12)', color: '#60a5fa',
            fontSize: 13, fontWeight: 700,
          }}>
            View {creator.display_name}&apos;s Profile
          </Link>
        </div>
      </div>
    );
  }

  // No community created yet by creator
  if (!community) {
    return (
      <div style={{ padding: '40px 28px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
        This creator hasn&apos;t set up their community yet.
      </div>
    );
  }

  // Fetch posts
  const { data: posts } = await supabase
    .from('community_posts')
    .select('id, community_id, author_user_id, content, video_url, post_type, is_pinned, like_count, comment_count, created_at')
    .eq('community_id', community.id)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  const postList = posts ?? [];
  const postIds = postList.map(p => p.id);

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
    nameMap[p.user_id] ??= p.name ?? p.username ?? 'Member';
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
      <Link href="/community" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)',
        textDecoration: 'none', marginBottom: 24,
      }}>
        <ArrowLeft size={13} /> Community
      </Link>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 20, fontWeight: 800, color: 'var(--color-text)',
          margin: '0 0 4px', letterSpacing: '-0.03em',
        }}>
          {community.name}
        </h1>
        {community.description && (
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 4px' }}>
            {community.description}
          </p>
        )}
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0, fontFamily: 'var(--font-mono)' }}>
          {community.post_count} post{community.post_count !== 1 ? 's' : ''}
        </p>
      </div>

      <MemberCommunityClient
        community={community}
        posts={enrichedPosts}
        currentUserId={user.id}
        slug={creatorSlug}
        canPost={isMember || isCreator}
      />
    </div>
  );
}
