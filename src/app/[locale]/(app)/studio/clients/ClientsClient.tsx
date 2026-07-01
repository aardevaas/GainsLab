'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { assignClient, approveJoinRequest, declineJoinRequest, type ClientState } from './actions';
import { Plus, X, Loader2, Check, Users, UserCheck, UserX, ChevronRight } from 'lucide-react';

type Program = { id: string; title: string; type: string };

type Client = {
  id: string;
  member_user_id: string;
  status: string;
  current_week: number;
  start_date: string;
  program_id: string | null;
  notes: string | null;
};

const STATUS_COLOR: Record<string, string> = {
  active: '#4ade80',
  paused: '#fbbf24',
  completed: '#60a5fa',
  cancelled: '#f87171',
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-border)', borderRadius: 10,
  padding: '10px 14px', fontSize: 13, color: 'var(--color-text)',
  outline: 'none', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)',
  letterSpacing: '0.05em', display: 'block', marginBottom: 5,
};

type Props = { clients: Client[]; programs: Program[]; profileMap: Record<string, string> };

export function ClientsClient({ clients, programs, profileMap }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [state, action, pending] = useActionState<ClientState, FormData>(assignClient, {});

  if (state.success && showForm) setShowForm(false);

  const joinRequests = clients.filter(c => c.notes === '__join_request__' && c.status === 'paused');
  const activeClients = clients.filter(c => !(c.notes === '__join_request__' && c.status === 'paused'));

  function displayName(userId: string) {
    return profileMap[userId] ?? userId.slice(0, 8);
  }

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', margin: '0 0 2px' }}>
            Clients
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            {activeClients.filter(c => c.status === 'active').length} active ·{' '}
            {activeClients.length} total
            {joinRequests.length > 0 && (
              <> · <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                {joinRequests.length} pending request{joinRequests.length !== 1 ? 's' : ''}
              </span></>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: '#60a5fa', color: '#0a0c0f', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(96,165,250,0.25)',
          }}
        >
          <Plus size={14} /> Add Client
        </button>
      </div>

      {/* Add Client form */}
      {showForm && (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid rgba(96,165,250,0.3)',
          borderRadius: 14, padding: '22px 24px', marginBottom: 20,
          boxShadow: '0 4px 24px rgba(96,165,250,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Add New Client</h3>
            <button type="button" onClick={() => setShowForm(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <X size={16} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
          <form action={action}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Member Username *</label>
                <input name="username" required placeholder="their GainsLab username" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Assign Program</label>
                <select name="program_id" style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">No program yet</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input name="start_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Notes (optional)</label>
                <input name="notes" placeholder="Goals, context, special notes…" style={inputStyle} />
              </div>
            </div>
            {state.error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 14,
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
                fontSize: 12, color: '#f87171',
              }}>
                {state.error}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={pending} style={{
                padding: '9px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700,
                background: pending ? 'var(--color-surface-elevated)' : '#60a5fa',
                color: pending ? 'var(--color-text-muted)' : '#0a0c0f',
                border: 'none', cursor: pending ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {pending ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={13} />}
                {pending ? 'Adding…' : 'Add to Roster'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                background: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)', cursor: 'pointer',
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── JOIN REQUESTS ── */}
      {joinRequests.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#fbbf24', fontFamily: 'var(--font-mono)', margin: '0 0 10px',
          }}>
            Pending Join Requests — {joinRequests.length}
          </p>
          <div style={{ border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, overflow: 'hidden', background: 'rgba(251,191,36,0.03)' }}>
            {joinRequests.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                borderBottom: i < joinRequests.length - 1 ? '1px solid rgba(251,191,36,0.12)' : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(251,191,36,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fbbf24',
                }}>
                  {displayName(c.member_user_id).slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 2px' }}>
                    @{displayName(c.member_user_id)}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
                    Requested {new Date(c.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <form action={approveJoinRequest.bind(null, c.id)}>
                    <button type="submit" style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      background: 'rgba(74,222,128,0.12)', color: '#4ade80',
                      border: '1px solid rgba(74,222,128,0.3)', cursor: 'pointer',
                    }}>
                      <UserCheck size={12} /> Approve
                    </button>
                  </form>
                  <form action={declineJoinRequest.bind(null, c.id)}>
                    <button type="submit" style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      background: 'rgba(248,113,113,0.08)', color: '#f87171',
                      border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer',
                    }}>
                      <UserX size={12} /> Decline
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ROSTER TABLE ── */}
      {activeClients.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 300, gap: 14, textAlign: 'center',
          border: '1px dashed var(--color-border)', borderRadius: 16,
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(96,165,250,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} style={{ color: '#60a5fa' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 5px' }}>No clients yet</h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0, maxWidth: 280 }}>
              Add your first client above, or share your profile so members can request to join.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1.5fr 100px 100px 80px 64px',
            padding: '10px 20px',
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}>
            {['Client', 'Program', 'Status', 'Progress', 'Since', ''].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {h}
              </span>
            ))}
          </div>
          {activeClients.map((c, i) => {
            const prog = programs.find(p => p.id === c.program_id);
            const color = STATUS_COLOR[c.status] ?? 'var(--color-text-muted)';
            const name = displayName(c.member_user_id);
            return (
              <div key={c.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 1.5fr 100px 100px 80px 64px',
                padding: '14px 20px', alignItems: 'center',
                borderBottom: i < activeClients.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(96,165,250,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#60a5fa',
                  }}>
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                    @{name}
                  </p>
                </div>
                <span style={{ fontSize: 12, color: prog ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                  {prog?.title ?? '—'}
                </span>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 10, fontWeight: 700, textTransform: 'capitalize',
                  letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', color,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  {c.status}
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  Week {c.current_week}
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {new Date(c.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <Link href={`/studio/clients/${c.id}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 11, fontWeight: 700, color: '#60a5fa',
                  textDecoration: 'none', padding: '5px 8px',
                  borderRadius: 7, background: 'rgba(96,165,250,0.08)',
                  border: '1px solid rgba(96,165,250,0.15)',
                }}>
                  View <ChevronRight size={11} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
