'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2, Lock } from 'lucide-react';
import { generateCheckinDigest } from './actions';

type Props = {
  checkinId: string;
  isPro: boolean;
  hasResponses: boolean;
};

export function CheckinDigestPanel({ checkinId, isPro, hasResponses }: Props) {
  const [digest, setDigest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateCheckinDigest(checkinId);
      if ('error' in result) setError(result.error);
      else setDigest(result.digest);
    });
  }

  if (!isPro) {
    return (
      <div style={{
        marginBottom: 24, padding: '14px 18px', borderRadius: 12,
        background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Lock size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
            AI digests (summarize all responses in a click) are a Pro feature.
          </p>
        </div>
        <Link href="/subscribe" style={{
          flexShrink: 0, fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8,
          background: 'rgba(251,191,36,0.12)', color: '#fbbf24',
          textDecoration: 'none', border: '1px solid rgba(251,191,36,0.25)',
        }}>
          Upgrade →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {!digest && (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isPending || !hasResponses}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: 'rgba(167,139,250,0.1)', color: '#a78bfa',
            border: '1px solid rgba(167,139,250,0.25)',
            cursor: isPending || !hasResponses ? 'not-allowed' : 'pointer',
            opacity: !hasResponses ? 0.5 : 1,
          }}
        >
          {isPending ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Sparkles size={14} />}
          {isPending ? 'Summarizing…' : 'Generate AI Digest'}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </button>
      )}

      {error && (
        <p style={{ marginTop: 10, fontSize: 12, color: '#f87171' }}>{error}</p>
      )}

      {digest && (
        <div style={{
          padding: '16px 20px', borderRadius: 14,
          background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Sparkles size={13} style={{ color: '#a78bfa' }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a78bfa' }}>
              AI Digest
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
            {digest}
          </p>
          <button
            type="button"
            onClick={() => { setDigest(null); handleGenerate(); }}
            disabled={isPending}
            style={{
              marginTop: 12, fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
