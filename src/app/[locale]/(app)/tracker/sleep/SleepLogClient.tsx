'use client';

import { useActionState, useState, useOptimistic, startTransition } from 'react';
import { Moon, Star, Trash2, TrendingUp, Clock, Zap } from 'lucide-react';
import { logSleep, deleteSleepLog } from './actions';

type SleepLog = {
  id: string;
  date: string;
  hours: number;
  quality_rating: number;
  notes: string | null;
  created_at: string;
};

type Props = {
  logs: SleepLog[];
  todayStr: string;
};

function qualityColor(q: number) {
  if (q >= 4) return '#4ade80';
  if (q >= 3) return '#fbbf24';
  return '#f87171';
}

function qualityLabel(q: number) {
  return ['', 'Poor', 'Fair', 'Okay', 'Good', 'Great'][q] ?? '';
}

function hoursColor(h: number) {
  if (h >= 7) return '#4ade80';
  if (h >= 6) return '#fbbf24';
  return '#f87171';
}

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

export function SleepLogClient({ logs: initialLogs, todayStr }: Props) {
  const [logs, setLogs] = useOptimistic(initialLogs);
  const [state, action, pending] = useActionState(logSleep, {});
  const [quality, setQuality] = useState(4);
  const [hoverStar, setHoverStar] = useState(0);

  // Stats
  const last7 = logs.slice(0, 7);
  const avgHours = last7.length > 0
    ? last7.reduce((a, l) => a + l.hours, 0) / last7.length : 0;
  const avgQuality = last7.length > 0
    ? last7.reduce((a, l) => a + l.quality_rating, 0) / last7.length : 0;
  const goalNights = last7.filter(l => l.hours >= 7).length;

  // Chart: last 14 days
  const chart14 = logs.slice(0, 14).reverse();
  const maxH = Math.max(9, ...chart14.map(l => l.hours));

  function handleDelete(id: string) {
    startTransition(() => {
      setLogs(prev => prev.filter(l => l.id !== id));
      deleteSleepLog(id);
    });
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-surface-elevated)',
    border: '1px solid var(--color-border)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    color: 'var(--color-text)',
    outline: 'none',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
    textTransform: 'uppercase', color: 'var(--color-text-muted)',
    display: 'block', marginBottom: 6,
  };

  return (
    <div style={{ maxWidth: 680, padding: '28px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Moon size={20} style={{ color: '#a78bfa' }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.03em' }}>
            Sleep Log
          </h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
          Track sleep duration and quality to optimize recovery.
        </p>
      </div>

      {/* Stats */}
      {last7.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28,
        }}>
          {[
            {
              icon: <Clock size={14} style={{ color: '#60a5fa' }} />,
              label: 'Avg duration',
              value: `${avgHours.toFixed(1)}h`,
              sub: 'last 7 nights',
              color: hoursColor(avgHours),
            },
            {
              icon: <Star size={14} style={{ color: '#fbbf24' }} />,
              label: 'Avg quality',
              value: avgQuality.toFixed(1),
              sub: qualityLabel(Math.round(avgQuality)),
              color: qualityColor(Math.round(avgQuality)),
            },
            {
              icon: <Zap size={14} style={{ color: '#4ade80' }} />,
              label: '7h+ nights',
              value: `${goalNights}/7`,
              sub: 'goal met',
              color: goalNights >= 5 ? '#4ade80' : goalNights >= 3 ? '#fbbf24' : '#f87171',
            },
          ].map(s => (
            <div key={s.label} style={{
              padding: '14px 16px', borderRadius: 12,
              background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                {s.icon}
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {s.label}
                </span>
              </div>
              <p style={{ fontSize: 22, fontWeight: 800, color: s.color, margin: '0 0 2px', letterSpacing: '-0.03em' }}>
                {s.value}
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {chart14.length > 0 && (
        <div style={{
          padding: '20px', borderRadius: 14,
          background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
          marginBottom: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={14} style={{ color: 'var(--color-text-muted)' }} />
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Last {chart14.length} nights
            </p>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              {[['#4ade80', '≥7h'], ['#fbbf24', '6-7h'], ['#f87171', '<6h']].map(([c, l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--color-text-muted)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }} />
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
            {chart14.map(log => {
              const h = Math.max(8, (log.hours / maxH) * 72);
              return (
                <div key={log.id} title={`${fmtDate(log.date)}: ${log.hours}h · ${qualityLabel(log.quality_rating)}`}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%', height: h, borderRadius: '4px 4px 2px 2px',
                    background: hoursColor(log.hours),
                    opacity: 0.85,
                    transition: 'height 300ms ease',
                  }} />
                  <span style={{
                    fontSize: 9, color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-mono)',
                    transform: 'rotate(-30deg)', transformOrigin: 'center',
                    whiteSpace: 'nowrap',
                  }}>
                    {new Date(log.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
          {/* 7h reference line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1, height: 1, borderTop: '1px dashed rgba(74,222,128,0.3)' }} />
            <span style={{ fontSize: 9, color: 'rgba(74,222,128,0.6)', fontFamily: 'var(--font-mono)' }}>7h goal</span>
          </div>
        </div>
      )}

      {/* Log form */}
      <div style={{
        padding: '20px 22px', borderRadius: 14,
        background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
        marginBottom: 28,
      }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 18px' }}>
          Log tonight's sleep
        </p>

        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label htmlFor="sleep-date" style={labelStyle}>Date</label>
              <input
                id="sleep-date"
                type="date"
                name="date"
                defaultValue={todayStr}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="sleep-hours" style={labelStyle}>Hours slept</label>
              <input
                id="sleep-hours"
                type="number"
                name="hours"
                min="0.5"
                max="24"
                step="0.5"
                placeholder="7.5"
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Quality rating — star buttons */}
          <div>
            <label style={labelStyle}>Quality</label>
            <input type="hidden" name="quality" value={quality} />
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuality(n)}
                  onMouseEnter={() => setHoverStar(n)}
                  onMouseLeave={() => setHoverStar(0)}
                  style={{
                    width: 40, height: 40, borderRadius: 10, border: 'none',
                    background: (hoverStar || quality) >= n
                      ? 'rgba(251,191,36,0.15)'
                      : 'var(--color-surface-elevated)',
                    cursor: 'pointer', transition: 'background 100ms',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Star
                    size={16}
                    fill={(hoverStar || quality) >= n ? '#fbbf24' : 'none'}
                    style={{ color: (hoverStar || quality) >= n ? '#fbbf24' : 'var(--color-text-muted)' }}
                  />
                </button>
              ))}
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: qualityColor(hoverStar || quality),
                alignSelf: 'center', marginLeft: 6,
              }}>
                {qualityLabel(hoverStar || quality)}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="sleep-notes" style={labelStyle}>Notes <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
            <input
              id="sleep-notes"
              type="text"
              name="notes"
              placeholder="Woke up at 3am, vivid dreams…"
              maxLength={200}
              style={inputStyle}
            />
          </div>

          {state.error && (
            <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{state.error}</p>
          )}
          {state.success && (
            <p style={{ fontSize: 12, color: '#4ade80', margin: 0 }}>Sleep logged!</p>
          )}

          <button
            type="submit"
            disabled={pending}
            style={{
              padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: pending ? 'var(--color-surface-elevated)' : 'rgba(167,139,250,0.15)',
              border: '1px solid rgba(167,139,250,0.35)',
              color: pending ? 'var(--color-text-muted)' : '#a78bfa',
              cursor: pending ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-start',
              transition: 'all 150ms ease',
            }}
          >
            {pending ? 'Saving…' : 'Save sleep log'}
          </button>
        </form>
      </div>

      {/* History */}
      {logs.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Recent logs
          </p>
          <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
            {logs.slice(0, 10).map((log, i) => (
              <div key={log.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px',
                borderBottom: i < Math.min(logs.length, 10) - 1 ? '1px solid var(--color-border-subtle)' : 'none',
              }}>
                {/* Night icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(167,139,250,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Moon size={14} style={{ color: '#a78bfa' }} />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 3px' }}>
                    {fmtDate(log.date)}
                  </p>
                  {log.notes && (
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                      {log.notes}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <span style={{
                  fontSize: 16, fontWeight: 800, color: hoursColor(log.hours),
                  fontFamily: 'var(--font-mono)', flexShrink: 0,
                }}>
                  {log.hours}h
                </span>

                {/* Quality */}
                <div style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star
                      key={n}
                      size={10}
                      fill={n <= log.quality_rating ? '#fbbf24' : 'none'}
                      style={{ color: n <= log.quality_rating ? '#fbbf24' : 'var(--color-border)' }}
                    />
                  ))}
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(log.id)}
                  style={{
                    flexShrink: 0, padding: 5, borderRadius: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                  }}
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
