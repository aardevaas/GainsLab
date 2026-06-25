'use client';

import { useState, useTransition } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { submitRating } from './actions';

type Props = {
  rosterId: string;
  creatorId: string;
  creatorName: string;
  initialRating: number | null;
  initialReview: string | null;
};

export function RateCreatorCard({ rosterId, creatorId, creatorName, initialRating, initialReview }: Props) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(initialRating ?? 0);
  const [review, setReview] = useState(initialReview ?? '');
  const [submitted, setSubmitted] = useState(!!initialRating);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!selected) return;
    startTransition(async () => {
      const res = await submitRating(rosterId, creatorId, selected, review);
      if (res.error) {
        setError(res.error);
      } else {
        setSubmitted(true);
        setError('');
      }
    });
  }

  const display = hovered || selected;

  if (submitted) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh',
        gap: 16, padding: '40px 24px', textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircle2 size={28} style={{ color: 'var(--color-accent)' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Thanks for your review
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, maxWidth: 320, lineHeight: 1.7 }}>
            You gave {creatorName} {selected} star{selected !== 1 ? 's' : ''}. Your feedback helps other members find the right coach.
          </p>
        </div>
        {/* Stars readout */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <Star
              key={n}
              size={22}
              style={{ color: n <= selected ? '#fbbf24' : 'var(--color-border)', fill: n <= selected ? '#fbbf24' : 'transparent' }}
            />
          ))}
        </div>
        {review && (
          <p style={{
            fontSize: 14, color: 'var(--color-text-secondary)', maxWidth: 420,
            fontStyle: 'italic', lineHeight: 1.7, margin: 0,
          }}>
            &ldquo;{review}&rdquo;
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh',
      gap: 24, padding: '40px 24px', textAlign: 'center',
    }}>
      {/* Icon */}
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Star size={28} style={{ color: '#fbbf24' }} />
      </div>

      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          You completed the program!
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, maxWidth: 360, lineHeight: 1.7 }}>
          How was your experience with <strong style={{ color: 'var(--color-text)' }}>{creatorName}</strong>?
          Your rating helps the community.
        </p>
      </div>

      {/* Star picker */}
      <div
        style={{ display: 'flex', gap: 10 }}
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setSelected(n)}
            onMouseEnter={() => setHovered(n)}
            style={{
              background: 'none', border: 'none', padding: 4,
              cursor: 'pointer', transition: 'transform 120ms ease',
              transform: n <= display ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            <Star
              size={34}
              style={{
                color: n <= display ? '#fbbf24' : 'var(--color-border)',
                fill: n <= display ? '#fbbf24' : 'transparent',
                transition: 'color 100ms ease, fill 100ms ease',
              }}
            />
          </button>
        ))}
      </div>

      {selected > 0 && (
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: -12 }}>
          {['', 'Poor', 'Fair', 'Good', 'Great', 'Outstanding'][selected]}
        </span>
      )}

      {/* Optional review text */}
      <textarea
        value={review}
        onChange={e => setReview(e.target.value)}
        maxLength={400}
        placeholder="Leave a short review (optional)"
        rows={3}
        style={{
          width: '100%', maxWidth: 400, resize: 'vertical',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 10, padding: '10px 14px',
          fontSize: 13, color: 'var(--color-text)', lineHeight: 1.6,
          outline: 'none', fontFamily: 'inherit',
        }}
      />

      {error && (
        <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{error}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selected || isPending}
        style={{
          padding: '10px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700,
          background: selected ? 'var(--color-accent)' : 'var(--color-surface)',
          color: selected ? '#0a0c0f' : 'var(--color-text-muted)',
          border: selected ? 'none' : '1px solid var(--color-border)',
          cursor: selected ? 'pointer' : 'not-allowed',
          opacity: isPending ? 0.7 : 1,
          transition: 'all 150ms ease',
        }}
      >
        {isPending ? 'Submitting…' : 'Submit Review'}
      </button>

      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '-12px 0 0' }}>
        Your review will appear publicly on the coach&apos;s profile.
      </p>
    </div>
  );
}
