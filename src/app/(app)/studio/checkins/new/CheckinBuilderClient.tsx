'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { createCheckin, type CheckinQuestion, type QuestionType } from './actions';

type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

type Program = { id: string; title: string };

const FREQ_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'daily',    label: 'Daily' },
  { value: 'weekly',   label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly',  label: 'Monthly' },
];

const DOW_OPTIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TYPE_OPTIONS: { value: QuestionType; label: string; desc: string }[] = [
  { value: 'text',       label: 'Text',    desc: 'Free-form answer' },
  { value: 'number',     label: 'Number',  desc: 'Numeric value (weight, calories…)' },
  { value: 'scale_1_10', label: 'Scale',   desc: '1-10 rating' },
];

function makeId() {
  return `q_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

type Props = { programs: Program[] };

export function CheckinBuilderClient({ programs }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('weekly');
  const [sendDay, setSendDay] = useState<number>(1); // Monday default
  const [programId, setProgramId] = useState<string>('');
  const [questions, setQuestions] = useState<CheckinQuestion[]>([
    { id: makeId(), question: '', type: 'text' },
  ]);

  function addQuestion() {
    setQuestions(prev => [...prev, { id: makeId(), question: '', type: 'text' }]);
  }

  function updateQuestion(id: string, patch: Partial<CheckinQuestion>) {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));
  }

  function removeQuestion(id: string) {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter(q => q.id !== id));
  }

  function handleSubmit() {
    if (!title.trim()) { setError('Give your check-in a title.'); return; }
    const validQs = questions.filter(q => q.question.trim());
    if (validQs.length === 0) { setError('Add at least one question.'); return; }

    setError(null);
    startTransition(async () => {
      const res = await createCheckin({
        title,
        frequency,
        sendDayOfWeek: (frequency === 'weekly' || frequency === 'biweekly') ? sendDay : null,
        programId: programId || null,
        questions: validQs,
      });
      if (res.error) { setError(res.error); return; }
      router.push('/studio/checkins');
    });
  }

  const chip = (active: boolean) => ({
    padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 700,
    background: active ? 'rgba(96,165,250,0.15)' : 'var(--color-surface-elevated)',
    color: active ? '#60a5fa' : 'var(--color-text-muted)',
    transition: 'all 120ms ease',
  } as React.CSSProperties);

  const label = (text: string) => (
    <p style={{
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
      color: 'var(--color-text-muted)', margin: '0 0 8px', fontFamily: 'var(--font-mono)',
    }}>{text}</p>
  );

  return (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Title */}
      <div>
        {label('Check-in name')}
        <input
          type="text"
          placeholder="e.g. Weekly Progress Check"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 10,
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface-elevated)',
            color: 'var(--color-text)', fontSize: 14, fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Frequency */}
      <div>
        {label('Frequency')}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FREQ_OPTIONS.map(({ value, label: lbl }) => (
            <button key={value} type="button" style={chip(frequency === value)}
              onClick={() => setFrequency(value)}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Day of week — only for weekly / biweekly */}
      {(frequency === 'weekly' || frequency === 'biweekly') && (
        <div>
          {label('Send on')}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DOW_OPTIONS.map((d, i) => (
              <button key={d} type="button" style={chip(sendDay === i)}
                onClick={() => setSendDay(i)}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Program link (optional) */}
      {programs.length > 0 && (
        <div>
          {label('Link to program (optional)')}
          <select
            value={programId}
            onChange={e => setProgramId(e.target.value)}
            style={{
              padding: '9px 14px', borderRadius: 10,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-elevated)',
              color: 'var(--color-text)', fontSize: 13, fontFamily: 'inherit',
              minWidth: 220,
            }}
          >
            <option value="">All clients</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '6px 0 0' }}>
            Leaving blank sends to all your active clients.
          </p>
        </div>
      )}

      {/* Questions */}
      <div>
        {label(`Questions (${questions.length})`)}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {questions.map((q, idx) => (
            <div key={q.id} style={{
              padding: '14px 16px', borderRadius: 12,
              border: '1px solid var(--color-border-subtle)',
              background: 'var(--color-surface)',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  background: 'rgba(96,165,250,0.12)', color: '#60a5fa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-mono)',
                }}>
                  {idx + 1}
                </span>
                <input
                  type="text"
                  placeholder="Your question here…"
                  value={q.question}
                  onChange={e => updateQuestion(q.id, { question: e.target.value })}
                  style={{
                    flex: 1, padding: '7px 10px', borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-elevated)',
                    color: 'var(--color-text)', fontSize: 13, fontFamily: 'inherit',
                  }}
                />
                <button type="button" onClick={() => removeQuestion(q.id)}
                  disabled={questions.length <= 1}
                  style={{
                    background: 'none', border: 'none', cursor: questions.length <= 1 ? 'not-allowed' : 'pointer',
                    color: 'var(--color-text-muted)', padding: 4, opacity: questions.length <= 1 ? 0.3 : 1,
                  }}>
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Type selector */}
              <div style={{ display: 'flex', gap: 6, paddingLeft: 32 }}>
                {TYPE_OPTIONS.map(({ value, label: lbl, desc }) => (
                  <button key={value} type="button"
                    title={desc}
                    onClick={() => updateQuestion(q.id, { type: value })}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      fontSize: 11, fontWeight: 700,
                      background: q.type === value ? 'rgba(96,165,250,0.12)' : 'var(--color-surface-elevated)',
                      color: q.type === value ? '#60a5fa' : 'var(--color-text-muted)',
                    }}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button type="button" onClick={addQuestion} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 14px', borderRadius: 10,
            border: '1px dashed var(--color-border)', background: 'none',
            color: 'var(--color-text-muted)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}>
            <Plus size={14} />
            Add question
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p style={{ fontSize: 13, color: '#f87171', margin: 0, fontWeight: 600 }}>{error}</p>
      )}

      {/* Submit */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={() => router.back()} style={{
          padding: '10px 20px', borderRadius: 10,
          border: '1px solid var(--color-border)', background: 'none',
          color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={isPending} style={{
          padding: '10px 24px', borderRadius: 10, border: 'none',
          background: isPending ? 'rgba(96,165,250,0.3)' : 'rgba(96,165,250,0.15)',
          color: '#60a5fa', fontSize: 13, fontWeight: 700,
          cursor: isPending ? 'not-allowed' : 'pointer',
          transition: 'all 120ms ease',
        }}>
          {isPending ? 'Creating…' : 'Create Check-in'}
        </button>
      </div>
    </div>
  );
}
