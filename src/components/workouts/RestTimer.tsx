'use client';

import { useEffect, useRef, useState } from 'react';
import { Timer, X, Plus, Minus } from 'lucide-react';

type Props = {
  /** Seconds to count down from when (re)started. */
  durationSeconds: number;
  /** Bumps to restart the timer (e.g. a completed-set counter). 0 = idle. */
  restartKey: number;
  onDone?: () => void;
  onDismiss?: () => void;
};

/**
 * Between-sets rest countdown. Auto-starts when `restartKey` changes, counts
 * down, and can be extended (±15s) or skipped — the Hevy rest-timer feel.
 * Sticky-positioned by the parent.
 */
export function RestTimer({ durationSeconds, restartKey, onDone, onDismiss }: Props) {
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(durationSeconds);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  // (Re)start whenever the key changes.
  useEffect(() => {
    if (restartKey === 0) return;
    setTotal(durationSeconds);
    setRemaining(durationSeconds);
  }, [restartKey, durationSeconds]);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          doneRef.current?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [remaining > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  if (remaining <= 0) return null;

  const mm = Math.floor(remaining / 60);
  const ss = (remaining % 60).toString().padStart(2, '0');
  const pct = total > 0 ? (remaining / total) * 100 : 0;

  return (
    <div
      className="sticky bottom-3 z-10 rounded-xl border overflow-hidden shadow-lg"
      style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-accent)' }}
    >
      <div
        className="absolute inset-0 origin-left"
        style={{
          background: 'var(--color-accent-subtle)',
          transform: `scaleX(${pct / 100})`,
          transition: 'transform 1s linear',
        }}
      />
      <div className="relative flex items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Timer size={15} style={{ color: 'var(--color-accent)' }} />
          <span className="text-lg font-mono font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>
            {mm}:{ss}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            rest
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRemaining((r) => Math.max(1, r - 15))}
            className="flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <Minus size={11} />15
          </button>
          <button
            type="button"
            onClick={() => {
              setRemaining((r) => r + 15);
              setTotal((t) => t + 15);
            }}
            className="flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <Plus size={11} />15
          </button>
          <button
            type="button"
            onClick={() => {
              setRemaining(0);
              onDismiss?.();
            }}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
          >
            <X size={11} /> Skip
          </button>
        </div>
      </div>
    </div>
  );
}
