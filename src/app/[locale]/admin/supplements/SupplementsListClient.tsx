'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Eye, EyeOff, FlaskConical } from 'lucide-react';
import { EVIDENCE_COLORS, type EvidenceLevel } from '@/lib/supplements/types';
import { deleteSupplement, toggleSupplementPublish } from './actions';

type SupplementRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  evidence: EvidenceLevel;
  is_published: boolean;
};

type Props = { supplements: SupplementRow[] };

export function SupplementsListClient({ supplements }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleTogglePublish(id: string, current: boolean) {
    startTransition(async () => { await toggleSupplementPublish(id, current); });
  }

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    startTransition(async () => { await deleteSupplement(id); });
  }

  if (supplements.length === 0) {
    return (
      <div style={{
        padding: '48px 24px', textAlign: 'center',
        border: '1px dashed var(--color-border)', borderRadius: 16,
        color: 'var(--color-text-muted)', fontSize: 14,
      }}>
        <FlaskConical size={24} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5 }} />
        No supplements yet. Add the first one.
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      {supplements.map((s, i) => (
        <div
          key={s.id}
          className="flex items-center gap-4 px-5 py-3"
          style={{
            background: 'var(--color-surface)',
            borderBottom: i < supplements.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
          }}
        >
          <span
            className="size-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
            style={{ background: `${EVIDENCE_COLORS[s.evidence]}20`, color: EVIDENCE_COLORS[s.evidence] }}
          >
            {s.evidence}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{s.name}</p>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0"
                style={{
                  background: s.is_published ? 'rgba(74,222,128,0.1)' : 'var(--color-surface-elevated)',
                  color: s.is_published ? '#4ade80' : 'var(--color-text-muted)',
                }}
              >
                {s.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {s.category} · /{s.slug}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleTogglePublish(s.id, s.is_published)}
            disabled={isPending}
            title={s.is_published ? 'Unpublish' : 'Publish'}
            className="size-8 flex items-center justify-center rounded-lg border shrink-0"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            {s.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <Link
            href={`/admin/supplements/${s.id}`}
            className="size-8 flex items-center justify-center rounded-lg border shrink-0"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <Pencil size={14} />
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(s.id, s.name)}
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
