'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { PostCard } from '@/app/(app)/studio/community/StudioCommunityClient';
import { createPost, toggleLike, addComment, deleteComment } from '@/lib/community/actions';

type Comment = {
  id: string;
  author_user_id: string;
  authorName: string;
  content: string;
  created_at: string;
};

type Post = {
  id: string;
  community_id: string;
  author_user_id: string;
  authorName: string;
  content: string | null;
  video_url: string | null;
  post_type: string;
  is_pinned: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
  isLikedByMe: boolean;
  comments: Comment[];
};

type Props = {
  community: { id: string; name: string; description: string | null; post_count: number };
  posts: Post[];
  currentUserId: string;
  slug: string;
  canPost: boolean;
};

export function MemberCommunityClient({ community, posts, currentUserId, slug, canPost }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [memberContent, setMemberContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  function toggleComments(postId: string) {
    setExpandedComments(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  }

  function handleMemberPost() {
    startTransition(async () => {
      await createPost(community.id, memberContent, '', 'text', slug);
      setMemberContent('');
      router.refresh();
    });
  }

  function handleLike(postId: string) {
    startTransition(async () => {
      await toggleLike(postId, slug);
      router.refresh();
    });
  }

  function handleComment(postId: string) {
    const text = (commentInputs[postId] ?? '').trim();
    if (!text) return;
    startTransition(async () => {
      await addComment(postId, text, slug);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      router.refresh();
    });
  }

  function handleDeleteComment(commentId: string, postId: string) {
    startTransition(async () => {
      await deleteComment(commentId, postId, slug);
      router.refresh();
    });
  }

  return (
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Member composer (if member can post) */}
      {canPost && (
        <div style={{
          borderRadius: 14, border: '1px solid var(--color-border-subtle)',
          background: 'var(--color-surface)', padding: '16px 18px',
          display: 'flex', gap: 10, alignItems: 'flex-end',
        }}>
          <textarea
            rows={2}
            placeholder="Share something with the community…"
            value={memberContent}
            onChange={e => setMemberContent(e.target.value)}
            style={{
              flex: 1, resize: 'none', padding: '8px 10px',
              borderRadius: 8, border: '1px solid var(--color-border)',
              background: 'var(--color-surface-elevated)',
              color: 'var(--color-text)', fontSize: 13, fontFamily: 'inherit',
            }}
          />
          <button type="button" onClick={handleMemberPost} disabled={isPending || !memberContent.trim()} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '9px 14px', borderRadius: 8, border: 'none',
            background: 'rgba(74,222,128,0.12)', color: '#4ade80',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            opacity: !memberContent.trim() ? 0.5 : 1,
          }}>
            <Send size={12} />
          </button>
        </div>
      )}

      {/* Feed */}
      {posts.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center',
          border: '1px dashed var(--color-border)', borderRadius: 16,
          color: 'var(--color-text-muted)', fontSize: 14,
        }}>
          No posts yet. Check back soon!
        </div>
      ) : (
        posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            isCreator={false}
            isExpanded={expandedComments.has(post.id)}
            commentInput={commentInputs[post.id] ?? ''}
            isPending={isPending}
            onToggleComments={() => toggleComments(post.id)}
            onLike={() => handleLike(post.id)}
            onCommentChange={v => setCommentInputs(prev => ({ ...prev, [post.id]: v }))}
            onCommentSubmit={() => handleComment(post.id)}
            onDeleteComment={cid => handleDeleteComment(cid, post.id)}
          />
        ))
      )}
    </div>
  );
}
