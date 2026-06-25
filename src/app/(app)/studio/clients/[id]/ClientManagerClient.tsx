'use client';

import { useActionState, useState } from 'react';
import { Settings2, BookOpen, StickyNote, Check, Loader2 } from 'lucide-react';
import { assignProgram, updateRosterStatus, updateClientNotes } from './client-actions';

type Program = { id: string; title: string; type: string; duration_weeks: number };

type Props = {
  clientId: string;
  currentStatus: string;
  currentProgramId: string | null;
  currentNotes: string | null;
  programs: Program[];
};

const STATUS_OPTIONS = [
  { value: 'active',    label: 'Active',    color: '#4ade80' },
  { value: 'paused',    label: 'Paused',    color: '#fbbf24' },
  { value: 'completed', label: 'Completed', color: '#60a5fa' },
  { value: 'cancelled', label: 'Cancelled', color: '#f87171' },
] as const;

const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
  textTransform: 'uppercase', color: 'var(--color-text-muted)',
  display: 'block', marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-border)', borderRadius: 10,
  padding: '9px 13px', fontSize: 13, color: 'var(--color-text)',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
};

function SaveButton({ pending, success }: { pending: boolean; success?: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
        background: pending ? 'var(--color-surface-elevated)' : success ? 'rgba(74,222,128,0.12)' : 'rgba(96,165,250,0.12)',
        border: `1px solid ${success ? 'rgba(74,222,128,0.3)' : 'rgba(96,165,250,0.3)'}`,
        color: pending ? 'var(--color-text-muted)' : success ? '#4ade80' : '#60a5fa',
        cursor: pending ? 'not-allowed' : 'pointer',
        transition: 'all 150ms ease', whiteSpace: 'nowrap',
      }}
    >
      {pending ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : success ? <Check size={11} /> : null}
      {pending ? 'Saving…' : success ? 'Saved' : 'Save'}
    </button>
  );
}

export function ClientManagerClient({ clientId, currentStatus, currentProgramId, currentNotes, programs }: Props) {
  const [progState, progAction, progPending] = useActionState(assignProgram, {});
  const [statusState, statusAction, statusPending] = useActionState(updateRosterStatus, {});
  const [notesState, notesAction, notesPending] = useActionState(updateClientNotes, {});
  const [activeStatus, setActiveStatus] = useState(currentStatus);

  const cardStyle: React.CSSProperties = {
    padding: '18px 20px', borderRadius: 14,
    background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
    marginBottom: 16,
  };

  const sectionHeader = (icon: React.ReactNode, title: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      {icon}
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{title}</p>
    </div>
  );

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Settings2 size={14} style={{ color: 'var(--color-text-muted)' }} />
        <p style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--color-text-muted)', margin: 0,
          fontFamily: 'var(--font-mono)',
        }}>
          Management
        </p>
      </div>

      {/* Status */}
      <div style={cardStyle}>
        {sectionHeader(<span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_OPTIONS.find(s => s.value === activeStatus)?.color ?? '#60a5fa', flexShrink: 0 }} />, 'Status')}
        <form action={statusAction}>
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="status" value={activeStatus} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setActiveStatus(opt.value)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: `1px solid ${opt.color}33`,
                  background: activeStatus === opt.value ? `${opt.color}18` : 'var(--color-surface-elevated)',
                  color: activeStatus === opt.value ? opt.color : 'var(--color-text-muted)',
                  cursor: 'pointer', transition: 'all 120ms ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {statusState.error && <p style={{ fontSize: 11, color: '#f87171', margin: 0 }}>{statusState.error}</p>}
            <div style={{ marginLeft: 'auto' }}>
              <SaveButton pending={statusPending} success={statusState.success} />
            </div>
          </div>
        </form>
      </div>

      {/* Program assignment */}
      <div style={cardStyle}>
        {sectionHeader(<BookOpen size={13} style={{ color: '#a78bfa' }} />, 'Assigned Program')}
        <form action={progAction}>
          <input type="hidden" name="clientId" value={clientId} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor={`prog-${clientId}`} style={labelStyle}>Program</label>
              <select
                id={`prog-${clientId}`}
                name="programId"
                defaultValue={currentProgramId ?? ''}
                style={{ ...inputStyle, appearance: 'none' as const }}
              >
                <option value="">— No program —</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.duration_weeks}w)
                  </option>
                ))}
              </select>
            </div>
            <SaveButton pending={progPending} success={progState.success} />
          </div>
          {progState.error && <p style={{ fontSize: 11, color: '#f87171', margin: '8px 0 0' }}>{progState.error}</p>}
          {programs.length === 0 && (
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '8px 0 0' }}>
              No programs yet. <a href="/studio/programs/new" style={{ color: '#60a5fa' }}>Create one</a>.
            </p>
          )}
        </form>
      </div>

      {/* Internal notes */}
      <div style={cardStyle}>
        {sectionHeader(<StickyNote size={13} style={{ color: '#fbbf24' }} />, 'Internal Notes')}
        <form action={notesAction}>
          <input type="hidden" name="clientId" value={clientId} />
          <label htmlFor={`notes-${clientId}`} style={labelStyle}>
            Private — not visible to client
          </label>
          <textarea
            id={`notes-${clientId}`}
            name="notes"
            defaultValue={currentNotes ?? ''}
            rows={4}
            placeholder="Diet phase notes, injury flags, preferred training style…"
            style={{
              ...inputStyle,
              resize: 'vertical' as const,
              lineHeight: 1.55,
              minHeight: 88,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            {notesState.error && <p style={{ fontSize: 11, color: '#f87171', margin: 0 }}>{notesState.error}</p>}
            <div style={{ marginLeft: 'auto' }}>
              <SaveButton pending={notesPending} success={notesState.success} />
            </div>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
