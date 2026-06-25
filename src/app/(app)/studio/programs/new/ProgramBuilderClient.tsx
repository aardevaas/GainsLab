'use client';

import { useActionState, useState } from 'react';
import { createProgram, type ProgramState } from './actions';
import { Loader2, Zap, Info } from 'lucide-react';

const TYPE_OPTIONS = [
  { id: 'standard', label: 'Training Program', sub: 'Structured week-by-week plan' },
  { id: 'one_on_one', label: '1-on-1 Coaching', sub: 'Private, assigned per client' },
  { id: 'challenge', label: 'Challenge', sub: 'Time-bound group event' },
];

const GOAL_OPTIONS = [
  { id: 'fat_loss', label: 'Fat Loss' },
  { id: 'muscle_gain', label: 'Muscle Gain' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'performance', label: 'Performance' },
  { id: 'general', label: 'General Fitness' },
];

const DURATION_OPTIONS = [2, 4, 6, 8, 12, 16];
const TRAINING_DAYS = [3, 4, 5, 6, 7];

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-border)', borderRadius: 10,
  padding: '11px 14px', fontSize: 14, color: 'var(--color-text)',
  outline: 'none', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)',
  letterSpacing: '0.05em', display: 'block', marginBottom: 6,
};

const sectionHead: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.15em', color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-mono)', marginBottom: 16,
  paddingBottom: 12, borderBottom: '1px solid var(--color-border-subtle)',
};

function ChipSelect({ options, value, onChange, name }: {
  options: { id: string; label: string; sub?: string }[];
  value: string;
  onChange: (v: string) => void;
  name: string;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <input type="hidden" name={name} value={value} />
      {options.map(o => {
        const on = value === o.id;
        return (
          <button key={o.id} type="button" onClick={() => onChange(o.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            padding: o.sub ? '10px 14px' : '7px 14px',
            borderRadius: 10, cursor: 'pointer',
            border: on ? '1px solid rgba(96,165,250,0.5)' : '1px solid var(--color-border)',
            background: on ? 'rgba(96,165,250,0.08)' : 'var(--color-surface-elevated)',
            transition: 'all 150ms ease', textAlign: 'left',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: on ? '#60a5fa' : 'var(--color-text)' }}>
              {o.label}
            </span>
            {o.sub && (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{o.sub}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function NumberChip({ options, value, onChange, name }: {
  options: number[];
  value: number;
  onChange: (v: number) => void;
  name: string;
}) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <input type="hidden" name={name} value={value} />
      {options.map(o => {
        const on = value === o;
        return (
          <button key={o} type="button" onClick={() => onChange(o)} style={{
            padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
            border: on ? '1px solid rgba(96,165,250,0.5)' : '1px solid var(--color-border)',
            background: on ? 'rgba(96,165,250,0.08)' : 'var(--color-surface-elevated)',
            color: on ? '#60a5fa' : 'var(--color-text-secondary)',
            transition: 'all 150ms ease',
          }}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function ProgramBuilderClient() {
  const [type, setType] = useState('standard');
  const [goal, setGoal] = useState('fat_loss');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [trainingDays, setTrainingDays] = useState(5);
  const [isFree, setIsFree] = useState(false);
  const [state, action, pending] = useActionState<ProgramState, FormData>(createProgram, {});

  const totalDays = durationWeeks * 7;
  const trainingDaysTotal = durationWeeks * trainingDays;
  const restDaysTotal = totalDays - trainingDaysTotal;

  return (
    <form action={action} style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      {/* Left: Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Basic Info */}
        <section>
          <p style={sectionHead}>Program Info</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="title" style={labelStyle}>Program Title *</label>
              <input id="title" name="title" required placeholder="e.g. 12-Week Fat Loss Accelerator"
                style={inputStyle} />
            </div>
            <div>
              <label htmlFor="description" style={labelStyle}>Description</label>
              <textarea id="description" name="description" rows={3}
                placeholder="What will clients achieve? What makes this program different?…"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
            </div>
            <div>
              <label htmlFor="cover_image_url" style={labelStyle}>Cover Image URL</label>
              <input id="cover_image_url" name="cover_image_url" type="url"
                placeholder="https://…"
                style={inputStyle} />
            </div>
          </div>
        </section>

        {/* Type */}
        <section>
          <p style={sectionHead}>Program Type</p>
          <ChipSelect options={TYPE_OPTIONS} value={type} onChange={setType} name="type" />
        </section>

        {/* Goal */}
        <section>
          <p style={sectionHead}>Primary Goal</p>
          <ChipSelect
            options={GOAL_OPTIONS}
            value={goal}
            onChange={setGoal}
            name="goal"
          />
        </section>

        {/* Duration */}
        <section>
          <p style={sectionHead}>Duration (weeks)</p>
          <NumberChip options={DURATION_OPTIONS} value={durationWeeks} onChange={setDurationWeeks} name="duration_weeks" />
        </section>

        {/* Training Days */}
        <section>
          <p style={sectionHead}>Training Days per Week</p>
          <NumberChip options={TRAINING_DAYS} value={trainingDays} onChange={setTrainingDays} name="training_days" />
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
            Days {trainingDays + 1}–7 each week will be set as rest days by default.
          </p>
        </section>

        {/* Pricing */}
        <section>
          <p style={sectionHead}>Pricing</p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: 'column' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="is_free"
                value="1"
                checked={isFree}
                onChange={e => setIsFree(e.target.checked)}
                style={{ accentColor: '#60a5fa', width: 15, height: 15 }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
                This is a free program
              </span>
            </label>
            {!isFree && (
              <div style={{ width: '100%', maxWidth: 200 }}>
                <label htmlFor="price_bob" style={labelStyle}>Price (Bs.)</label>
                <input id="price_bob" name="price_bob" type="number" min="0" step="0.01"
                  placeholder="e.g. 250"
                  style={inputStyle} />
              </div>
            )}
          </div>
        </section>

        {/* Error */}
        {state.error && (
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
            fontSize: 13, color: '#f87171',
          }}>
            {state.error}
          </div>
        )}

        {/* Submit */}
        <div>
          <button type="submit" disabled={pending} style={{
            padding: '13px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700,
            background: pending ? 'var(--color-surface-elevated)' : '#60a5fa',
            color: pending ? 'var(--color-text-muted)' : '#0a0c0f',
            border: 'none', cursor: pending ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: pending ? 'none' : '0 4px 20px rgba(96,165,250,0.3)',
            transition: 'all 200ms ease',
          }}>
            {pending ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Zap size={16} />}
            {pending ? 'Creating…' : 'Create Program'}
          </button>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 10 }}>
            Program will be saved as a draft. Publish it when you're ready.
          </p>
        </div>
      </div>

      {/* Right: Preview */}
      <div style={{ width: 260, flexShrink: 0, position: 'sticky', top: 24 }}>
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
          borderRadius: 14, padding: '20px',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', margin: '0 0 16px' }}>
            Structure Preview
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Array.from({ length: Math.min(durationWeeks, 6) }, (_, w) => (
              <div key={w} style={{
                padding: '10px 12px', borderRadius: 8,
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border-subtle)',
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 5px' }}>
                  Week {w + 1}
                </p>
                <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {Array.from({ length: 7 }, (_, d) => (
                    <div key={d} style={{
                      width: 18, height: 18, borderRadius: 4, fontSize: 9, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: d < trainingDays ? 'rgba(96,165,250,0.2)' : 'var(--color-surface)',
                      color: d < trainingDays ? '#60a5fa' : 'var(--color-text-muted)',
                      border: `1px solid ${d < trainingDays ? 'rgba(96,165,250,0.3)' : 'var(--color-border-subtle)'}`,
                    }}>
                      {d + 1}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {durationWeeks > 6 && (
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', margin: '4px 0' }}>
                + {durationWeeks - 6} more weeks
              </p>
            )}
          </div>
          <div style={{
            marginTop: 16, padding: '12px', borderRadius: 8,
            background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
              <Info size={12} style={{ color: '#60a5fa', marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                <strong style={{ color: '#60a5fa' }}>{trainingDaysTotal} training days</strong>
                {' '}and{' '}
                <strong>{restDaysTotal} rest days</strong>
                {' '}generated automatically. Add exercises to each day after creation.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
