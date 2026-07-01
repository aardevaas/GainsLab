'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Eye, EyeOff, FileText } from 'lucide-react';
import { deleteArticle, toggleArticlePublish } from './actions';

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  is_published: boolean;
  reading_time: number;
  updated_at: string;
};

type Props = { articles: ArticleRow[] };

export function ArticlesListClient({ articles }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleTogglePublish(id: string, current: boolean) {
    startTransition(async () => { await toggleArticlePublish(id, current); });
  }

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    startTransition(async () => { await deleteArticle(id); });
  }

  if (articles.length === 0) {
    return (
      <div style={{
        padding: '48px 24px', textAlign: 'center',
        border: '1px dashed var(--color-border)', borderRadius: 16,
        color: 'var(--color-text-muted)', fontSize: 14,
      }}>
        <FileText size={24} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5 }} />
        No articles yet. Create the first one.
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      {articles.map((a, i) => (
        <div
          key={a.id}
          className="flex items-center gap-4 px-5 py-3"
          style={{
            background: 'var(--color-surface)',
            borderBottom: i < articles.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{a.title}</p>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0"
                style={{
                  background: a.is_published ? 'rgba(74,222,128,0.1)' : 'var(--color-surface-elevated)',
                  color: a.is_published ? '#4ade80' : 'var(--color-text-muted)',
                }}
              >
                {a.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {a.category} · {a.reading_time} min · /{a.slug}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleTogglePublish(a.id, a.is_published)}
            disabled={isPending}
            title={a.is_published ? 'Unpublish' : 'Publish'}
            className="size-8 flex items-center justify-center rounded-lg border shrink-0"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            {a.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <Link
            href={`/admin/articles/${a.id}`}
            className="size-8 flex items-center justify-center rounded-lg border shrink-0"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <Pencil size={14} />
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(a.id, a.title)}
            disabled={isPending}
            className="size-8 flex items-center justify-center rounded-lg border shrink-0 hover:text-red-400"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
