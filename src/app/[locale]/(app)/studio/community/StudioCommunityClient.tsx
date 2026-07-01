'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pin, Trash2, Heart, MessageCircle, Video, Send, ChevronDown } from 'lucide-react';
import { createPost, deletePost, togglePin, toggleLike, addComment, deleteComment } from '@/lib/community/actions';
import { safeHttpUrl } from '@/lib/utils';

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
};

export function StudioCommunityClient({ community, posts: initialPosts, currentUserId, slug }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Composer state
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Per-post UI state
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  function toggleComments(postId: string) {
    setExpandedComments(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  }

  function handlePost() {
    setPostError(null);
    startTransition(async () => {
      const res = await createPost(community.id, content, videoUrl, 'text', slug);
      if (res.error) { setPostError(res.error); return; }
      setContent(''); setVideoUrl(''); setShowVideoInput(false);
      router.refresh();
    });
  }

  function handleDelete(postId: string) {
    if (!confirm('Delete this post?')) return;
    startTransition(async () => {
      await deletePost(postId, community.id, slug);
      router.refresh();
    });
  }

  function handlePin(postId: string, current: boolean) {
    startTransition(async () => {
      await togglePin(postId, current, slug);
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
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Composer */}
      <div style={{
        borderRadius: 16, border: '1px solid var(--color-border-subtle)',
        background: 'var(--color-surface)', padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <textarea
          rows={3}
          placeholder="Share an update, tip, or announcement with your community…"
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{
            width: '100%', resize: 'vertical', padding: '10px 12px',
            borderRadius: 10, border: '1px solid var(--color-border)',
            background: 'var(--color-surface-elevated)',
            color: 'var(--color-text)', fontSize: 14, fontFamily: 'inherit',
            lineHeight: 1.6,
          }}
        />
        {showVideoInput && (
          <input
            type="url"
            placeholder="YouTube / TikTok / Instagram link…"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 10,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-elevated)',
              color: 'var(--color-text)', fontSize: 13, fontFamily: 'inherit',
              width: '100%',
            }}
          />
        )}
        {postError && (
          <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{postError}</p>
        )}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="button" onClick={() => setShowVideoInput(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 8, border: 'none',
            background: showVideoInput ? 'rgba(96,165,250,0.12)' : 'var(--color-surface-elevated)',
            color: showVideoInput ? '#60a5fa' : 'var(--color-text-muted)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            <Video size={12} /> Video link
          </button>
          <div style={{ flex: 1 }} />
          <button type="button" onClick={handlePost} disabled={isPending || (!content.trim() && !videoUrl.trim())} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 10, border: 'none',
            background: 'rgba(96,165,250,0.15)', color: '#60a5fa',
            fontSize: 13, fontWeight: 700,
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending || (!content.trim() && !videoUrl.trim()) ? 0.5 : 1,
          }}>
            <Send size={13} /> {isPending ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>

      {/* Feed */}
      {initialPosts.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center',
          border: '1px dashed var(--color-border)', borderRadius: 16,
          color: 'var(--color-text-muted)', fontSize: 14,
        }}>
          No posts yet. Share your first update above.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {initialPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              isCreator
              isExpanded={expandedComments.has(post.id)}
              commentInput={commentInputs[post.id] ?? ''}
              isPending={isPending}
              onToggleComments={() => toggleComments(post.id)}
              onLike={() => handleLike(post.id)}
              onPin={() => handlePin(post.id, post.is_pinned)}
              onDelete={() => handleDelete(post.id)}
              onCommentChange={v => setCommentInputs(prev => ({ ...prev, [post.id]: v }))}
              onCommentSubmit={() => handleComment(post.id)}
              onDeleteComment={cid => handleDeleteComment(cid, post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type CardProps = {
  post: Post;
  currentUserId: string;
  isCreator: boolean;
  isExpanded: boolean;
  commentInput: string;
  isPending: boolean;
  onToggleComments: () => void;
  onLike: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onCommentChange: (v: string) => void;
  onCommentSubmit: () => void;
  onDeleteComment: (id: string) => void;
};

export function PostCard({
  post, currentUserId, isCreator, isExpanded, commentInput, isPending,
  onToggleComments, onLike, onPin, onDelete, onCommentChange, onCommentSubmit, onDeleteComment,
}: CardProps) {
  return (
    <div style={{
      borderRadius: 16,
      border: post.is_pinned
        ? '1px solid rgba(251,191,36,0.3)'
        : '1px solid var(--color-border-subtle)',
      background: 'var(--color-surface)', overflow: 'hidden',
    }}>
      {/* Pinned indicator */}
      {post.is_pinned && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 16px',
          background: 'rgba(251,191,36,0.08)',
          borderBottom: '1px solid rgba(251,191,36,0.2)',
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: '#fbbf24', fontFamily: 'var(--font-mono)',
        }}>
          <Pin size={10} /> Pinned
        </div>
      )}

      {/* Post header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 18px 0',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(96,165,250,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, color: '#60a5fa',
        }}>
          {post.authorName.slice(0, 1).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
            {post.authorName}
          </p>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        {/* Creator controls */}
        {isCreator && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button type="button" onClick={onPin} disabled={isPending} title={post.is_pinned ? 'Unpin' : 'Pin'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5 }}>
              <Pin size={14} style={{ color: post.is_pinned ? '#fbbf24' : 'var(--color-text-muted)' }} />
            </button>
            <button type="button" onClick={onDelete} disabled={isPending} title="Delete"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5 }}>
              <Trash2 size={14} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '12px 18px' }}>
        {post.content && (
          <p style={{ fontSize: 14, color: 'var(--color-text)', margin: '0 0 10px', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
            {post.content}
          </p>
        )}
        {post.video_url && safeHttpUrl(post.video_url) && (
          <a href={post.video_url} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '8px 14px', borderRadius: 10,
            background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
            color: '#60a5fa', fontSize: 12, fontWeight: 600, textDecoration: 'none',
          }}>
            <Video size={13} /> Watch video →
          </a>
        )}
      </div>

      {/* Actions bar */}
      <div style={{
        display: 'flex', gap: 16, padding: '10px 18px 14px',
        borderTop: '1px solid var(--color-border-subtle)',
      }}>
        <button type="button" onClick={onLike} disabled={isPending} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600,
          color: post.isLikedByMe ? '#f87171' : 'var(--color-text-muted)',
        }}>
          <Heart size={14} fill={post.isLikedByMe ? '#f87171' : 'none'} />
          {post.like_count > 0 ? post.like_count : ''}
        </button>
        <button type="button" onClick={onToggleComments} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)',
        }}>
          <MessageCircle size={14} />
          {post.comment_count > 0 ? post.comment_count : ''}
          <ChevronDown size={11} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '150ms' }} />
        </button>
      </div>

      {/* Comments section */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid var(--color-border-subtle)', padding: '14px 18px' }}>
          {post.comments.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 12px' }}>
              No comments yet.
            </p>
          )}
          {post.comments.map(c => (
            <div key={c.id} style={{
              display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: 'var(--color-surface-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: 'var(--color-text-muted)',
              }}>
                {c.authorName.slice(0, 1).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>{c.authorName}</span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '2px 0 0', lineHeight: 1.5 }}>
                  {c.content}
                </p>
              </div>
              {(isCreator || c.author_user_id === currentUserId) && (
                <button type="button" onClick={() => onDeleteComment(c.id)}
                  disabled={isPending}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, flexShrink: 0 }}>
                  <Trash2 size={11} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              )}
            </div>
          ))}
          {/* Comment input */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <input
              type="text"
              placeholder="Add a comment…"
              value={commentInput}
              onChange={e => onCommentChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onCommentSubmit(); } }}
              style={{
                flex: 1, padding: '7px 10px', borderRadius: 8,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-elevated)',
                color: 'var(--color-text)', fontSize: 12, fontFamily: 'inherit',
              }}
            />
            <button type="button" onClick={onCommentSubmit} disabled={isPending || !commentInput.trim()} style={{
              padding: '7px 12px', borderRadius: 8, border: 'none',
              background: 'rgba(96,165,250,0.12)', color: '#60a5fa',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              opacity: !commentInput.trim() ? 0.5 : 1,
            }}>
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
