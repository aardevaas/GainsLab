'use client';

import { useEffect } from 'react';
import { Trophy, Flame, Zap } from 'lucide-react';
import type { Milestone } from './page';

const LEVELS = [
  { min: 0,     max: 499,   label: 'Rookie',     color: '#94a3b8' },
  { min: 500,   max: 1999,  label: 'Active',     color: '#4ade80' },
  { min: 2000,  max: 4999,  label: 'Consistent', color: '#38bdf8' },
  { min: 5000,  max: 9999,  label: 'Dedicated',  color: '#a78bfa' },
  { min: 10000, max: Infinity, label: 'Elite',   color: '#fb923c' },
] as const;

const MILESTONE_CELEBRATABLE = new Set([7, 14, 30, 60, 90]);

function getLevel(xp: number) {
  return LEVELS.find(l => xp >= l.min && xp <= l.max) ?? LEVELS[LEVELS.length - 1];
}

type Props = {
  totalXP: number;
  streak: number;
  milestones: Milestone[];
};

export function HabitXPBar({ totalXP, streak, milestones }: Props) {
  const level = getLevel(totalXP);
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1] ?? null;
  const pct = nextLevel
    ? Math.min(100, ((totalXP - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  // Fire confetti when streak lands exactly on a milestone
  useEffect(() => {
    if (!MILESTONE_CELEBRATABLE.has(streak)) return;
    let cancelled = false;
    import('canvas-confetti').then(mod => {
      if (cancelled) return;
      const confetti = mod.default;
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ['#4ade80', '#a78bfa', '#38bdf8', '#fb923c'] });
    });
    return () => { cancelled = true; };
  }, [streak]);

  return (
    <div
      className="rounded-xl border p-5 space-y-4"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Level + XP row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div
            className="size-9 rounded-lg flex items-center justify-center"
            style={{ background: level.color + '22' }}
          >
            <Zap size={16} style={{ color: level.color }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: level.color }}>{level.label}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {totalXP.toLocaleString()} XP
              {nextLevel ? ` · ${(nextLevel.min - totalXP).toLocaleString()} to ${nextLevel.label}` : ' · Max level'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame size={15} style={{ color: streak > 0 ? '#fb923c' : 'var(--color-text-muted)' }} />
          <span className="text-lg font-bold tabular-nums" style={{ color: streak > 0 ? '#fb923c' : 'var(--color-text-muted)' }}>
            {streak}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>day streak</span>
        </div>
      </div>

      {/* XP progress bar */}
      <div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-elevated)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: level.color }}
          />
        </div>
      </div>

      {/* Milestone badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {milestones.map(m => (
          <div
            key={m.days}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold"
            style={{
              borderColor: m.earned ? '#fbbf24' : 'var(--color-border)',
              background: m.earned ? 'rgba(251,191,36,0.1)' : 'var(--color-surface-elevated)',
              color: m.earned ? '#fbbf24' : 'var(--color-text-muted)',
              opacity: m.earned ? 1 : 0.5,
            }}
          >
            <Trophy size={11} />
            {m.label}
          </div>
        ))}
        <p className="text-[11px] ml-1" style={{ color: 'var(--color-text-muted)' }}>streak milestones</p>
      </div>
    </div>
  );
}
