'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ToggleLeft, ToggleRight, Trash2, MessageSquare } from 'lucide-react';
import { toggleCheckinActive, deleteCheckin } from './new/actions';

const FREQ_LABEL: Record<string, string> = {
  daily: 'Daily', weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly',
};

const DOW_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Checkin = {
  id: string;
  title: string;
  frequency: string;
  send_day_of_week: number | null;
  program_id: string | null;
  is_active: boolean;
  questionCount: number;
  responseCount: number;
  programTitle: string | null;
};

type Props = { checkins: Checkin[] };

export function CheckinsListClient({ checkins }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: string, current: boolean, e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      await toggleCheckinActive(id, current);
      router.refresh();
    });
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this check-in? All responses will also be deleted.')) return;
    startTransition(async () => {
      await deleteCheckin(id);
      router.refresh();
    });
  }

  if (checkins.length === 0) {
    return (
      <div style={{
        padding: '60px 24px', textAlign: 'center',
        border: '1px dashed var(--color-border)', borderRadius: 16,
        color: 'var(--color-text-muted)', fontSize: 14,
      }}>
        No check-ins yet. Create one to start collecting weekly feedback from your clients.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {checkins.map(c => (
        <div
          key={c.id}
          onClick={() => router.push(`/studio/checkins/${c.id}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '16px 20px', borderRadius: 14,
            border: '1px solid var(--color-border-subtle)',
            background: 'var(--color-surface)',
            cursor: 'pointer', transition: 'border-color 150ms ease',
            opacity: c.is_active ? 1 : 0.6,
          }}
        >
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 14, fontWeight: 700, color: 'var(--color-text)',
              margin: '0 0 5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {c.title}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Chip text={FREQ_LABEL[c.frequency] ?? c.frequency} color="#60a5fa" />
              {c.send_day_of_week != null && (
                <Chip text={`${DOW_SHORT[c.send_day_of_week]}s`} color="var(--color-text-muted)" />
              )}
              <Chip
                text={c.programTitle ?? 'All clients'}
                color="var(--color-text-muted)"
              />
              <Chip text={`${c.questionCount}Q`} color="var(--color-text-muted)" />
            </div>
          </div>

          {/* Response count */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
              <MessageSquare size={12} style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                {c.responseCount}
              </span>
            </div>
            <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
              responses
            </p>
          </div>

          {/* Active toggle */}
          <button
            type="button"
            onClick={e => handleToggle(c.id, c.is_active, e)}
            disabled={isPending}
            title={c.is_active ? 'Deactivate' : 'Activate'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
          >
            {c.is_active
              ? <ToggleRight size={22} style={{ color: '#4ade80' }} />
              : <ToggleLeft size={22} style={{ color: 'var(--color-text-muted)' }} />
            }
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={e => handleDelete(c.id, e)}
            disabled={isPending}
            title="Delete"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
          >
            <Trash2 size={15} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      ))}
    </div>
  );
}

function Chip({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)',
      padding: '2px 7px', borderRadius: 5,
      background: 'var(--color-surface-elevated)', color,
    }}>
      {text}
    </span>
  );
}
