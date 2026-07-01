'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { submitCheckinResponse } from './actions';

type Question = { id: string; question: string; type: string };

type Props = {
  checkinId: string;
  title: string;
  questions: Question[];
};

export function CheckinFormClient({ checkinId, title, questions }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setAnswer(id: string, value: string | number) {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const res = await submitCheckinResponse(checkinId, answers);
      if (res.error) { setError(res.error); return; }
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 16, padding: '60px 24px', textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircle size={24} style={{ color: '#4ade80' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 6px' }}>
            Check-in submitted!
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            Your trainer will review your response.
          </p>
        </div>
        <button type="button" onClick={() => router.push('/my-program')} style={{
          marginTop: 8, padding: '9px 20px', borderRadius: 10,
          border: 'none', background: 'rgba(74,222,128,0.12)',
          color: '#4ade80', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>
          Back to My Program
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{
          fontSize: 20, fontWeight: 800, color: 'var(--color-text)',
          margin: '0 0 4px', letterSpacing: '-0.02em',
        }}>
          {title}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
          Answer as honestly as you can — this helps your trainer adjust your plan.
        </p>
      </div>

      {questions.map((q, i) => (
        <div key={q.id} style={{
          padding: '18px 20px', borderRadius: 14,
          border: '1px solid var(--color-border-subtle)',
          background: 'var(--color-surface)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{
              width: 22, height: 22, borderRadius: 7, flexShrink: 0,
              background: 'rgba(74,222,128,0.1)', color: '#4ade80',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800,
            }}>
              {i + 1}
            </span>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', margin: 0, lineHeight: 1.5 }}>
              {q.question}
            </p>
          </div>

          {q.type === 'text' && (
            <textarea
              rows={3}
              placeholder="Your answer…"
              value={(answers[q.id] as string) ?? ''}
              onChange={e => setAnswer(q.id, e.target.value)}
              style={{
                width: '100%', resize: 'vertical', padding: '9px 12px',
                borderRadius: 10, border: '1px solid var(--color-border)',
                background: 'var(--color-surface-elevated)',
                color: 'var(--color-text)', fontSize: 13, fontFamily: 'inherit',
              }}
            />
          )}

          {q.type === 'number' && (
            <input
              type="number"
              placeholder="0"
              value={(answers[q.id] as number) ?? ''}
              onChange={e => setAnswer(q.id, e.target.value === '' ? '' : Number(e.target.value))}
              style={{
                padding: '9px 12px', borderRadius: 10,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-elevated)',
                color: 'var(--color-text)', fontSize: 14, fontWeight: 700,
                fontFamily: 'var(--font-mono)', width: 120,
              }}
            />
          )}

          {q.type === 'scale_1_10' && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Array.from({ length: 10 }, (_, k) => k + 1).map(n => {
                const selected = answers[q.id] === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setAnswer(q.id, n)}
                    style={{
                      width: 36, height: 36, borderRadius: 9,
                      cursor: 'pointer', fontSize: 13, fontWeight: 700,
                      background: selected ? 'rgba(74,222,128,0.2)' : 'var(--color-surface-elevated)',
                      color: selected ? '#4ade80' : 'var(--color-text-muted)',
                      border: selected ? '1px solid rgba(74,222,128,0.4)' : '1px solid transparent',
                      transition: 'all 100ms ease',
                    }}>
                    {n}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {error && (
        <p style={{ fontSize: 13, color: '#f87171', margin: 0, fontWeight: 600 }}>{error}</p>
      )}

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
          background: isPending ? 'rgba(74,222,128,0.15)' : 'rgba(74,222,128,0.12)',
          color: '#4ade80', fontSize: 13, fontWeight: 700,
          cursor: isPending ? 'not-allowed' : 'pointer',
        }}>
          {isPending ? 'Submitting…' : 'Submit Check-in'}
        </button>
      </div>
    </div>
  );
}
