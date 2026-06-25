'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function refreshLikeCount(supabase: Awaited<ReturnType<typeof createClient>>, postId: string) {
  const { count } = await supabase
    .from('community_post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);
  await supabase
    .from('community_posts')
    .update({ like_count: count ?? 0 })
    .eq('id', postId);
}

async function refreshCommentCount(supabase: Awaited<ReturnType<typeof createClient>>, postId: string) {
  const { count } = await supabase
    .from('community_post_comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);
  await supabase
    .from('community_posts')
    .update({ comment_count: count ?? 0 })
    .eq('id', postId);
}

function revalidateAll(slug?: string) {
  revalidatePath('/studio/community');
  revalidatePath('/community', 'layout');
  if (slug) revalidatePath(`/community/${slug}`);
}

export async function createPost(
  communityId: string,
  content: string,
  videoUrl: string,
  postType: 'text' | 'video',
  slug?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (!content.trim() && !videoUrl.trim()) return { error: 'Post cannot be empty.' };

  const { error } = await supabase.from('community_posts').insert({
    community_id: communityId,
    author_user_id: user.id,
    content: content.trim() || null,
    image_urls: [],
    video_url: videoUrl.trim() || null,
    post_type: videoUrl.trim() ? 'video' : postType,
  });

  if (error) return { error: error.message };

  // Increment post_count on community
  const { data: comm } = await supabase
    .from('creator_communities')
    .select('post_count')
    .eq('id', communityId)
    .single();
  if (comm) {
    await supabase
      .from('creator_communities')
      .update({ post_count: comm.post_count + 1 })
      .eq('id', communityId);
  }

  revalidateAll(slug);
  return { ok: true };
}

export async function deletePost(postId: string, communityId: string, slug?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', postId);

  if (error) return { error: error.message };

  // Decrement post_count
  const { data: comm } = await supabase
    .from('creator_communities')
    .select('post_count')
    .eq('id', communityId)
    .single();
  if (comm && comm.post_count > 0) {
    await supabase
      .from('creator_communities')
      .update({ post_count: comm.post_count - 1 })
      .eq('id', communityId);
  }

  revalidateAll(slug);
  return { ok: true };
}

export async function togglePin(postId: string, current: boolean, slug?: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('community_posts')
    .update({ is_pinned: !current })
    .eq('id', postId);

  if (error) return { error: error.message };
  revalidateAll(slug);
  return { ok: true };
}

export async function toggleLike(postId: string, slug?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: existing } = await supabase
    .from('community_post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('community_post_likes')
      .delete().eq('post_id', postId).eq('user_id', user.id);
  } else {
    await supabase.from('community_post_likes')
      .insert({ post_id: postId, user_id: user.id });
  }

  await refreshLikeCount(supabase, postId);
  revalidateAll(slug);
  return { ok: true, liked: !existing };
}

export async function addComment(postId: string, content: string, slug?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  if (!content.trim()) return { error: 'Comment cannot be empty.' };

  const { error } = await supabase.from('community_post_comments').insert({
    post_id: postId,
    author_user_id: user.id,
    content: content.trim(),
  });

  if (error) return { error: error.message };
  await refreshCommentCount(supabase, postId);
  revalidateAll(slug);
  return { ok: true };
}

export async function deleteComment(commentId: string, postId: string, slug?: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('community_post_comments')
    .delete()
    .eq('id', commentId);

  if (error) return { error: error.message };
  await refreshCommentCount(supabase, postId);
  revalidateAll(slug);
  return { ok: true };
}
