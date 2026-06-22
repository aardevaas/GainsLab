'use client';

import { useState } from 'react';

export type DayScore = {
  date: string;
  label: string;
  monthLabel: string | null;
  score: 0 | 1 | 2 | 3;
  foodLogged: boolean;
  workoutLogged: boolean;
  isFuture: boolean;
};

const SCORE_COLORS: Record<number, string> = {
  0: 'var(--color-surface-elevated)',
  1: 'rgba(74,222,128,0.2)',
  2: 'rgba(74,222,128,0.5)',
  3: '#4ade80',
};

const SCORE_LABELS: Record<number, string> = {
  0: 'No activity',
  1: 'Food logged',
  2: 'Food + workout',
  3: 'Food + workout + goal hit',
};

type Props = {
  weeks: DayScore[][];
  streak: number;
  totalActive: number;
};

export function HabitHeatmap({ weeks, streak, totalActive }: Props) {
  const [tooltip, setTooltip] = useState<{ day: DayScore; x: number; y: number } | null>(null);

  return (
    <div>
      {/* Stats row */}
      <div className="flex items-center gap-6 mb-5">
        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)', letterSpacing: '-0.03em' }}>
            {streak}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>day streak</p>
        </div>
        <div
          className="w-px h-8 self-center"
          style={{ background: 'var(--color-border)' }}
        />
        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
            {totalActive}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>active days (90d)</p>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="relative overflow-x-auto pb-2">
        {/* Month labels */}
        <div className="flex mb-1 ml-7">
          {weeks.map((week, wi) => {
            const label = week.find(d => d.monthLabel)?.monthLabel;
            return (
              <div key={wi} style={{ width: 14, marginRight: 2 }}>
                {label && (
                  <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1" style={{ width: 24 }}>
            {['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map((d, i) => (
              <div key={i} className="h-3.5 flex items-center">
                <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{d}</span>
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => (
                <div
                  key={di}
                  className="rounded-sm cursor-pointer"
                  style={{
                    width: 14,
                    height: 14,
                    background: day.isFuture ? 'transparent' : SCORE_COLORS[day.score],
                    border: day.isFuture ? 'none' : '1px solid rgba(255,255,255,0.04)',
                  }}
                  onMouseEnter={e => {
                    if (!day.isFuture) {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setTooltip({ day, x: rect.left, y: rect.bottom });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 ml-7">
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Less</span>
          {[0, 1, 2, 3].map(s => (
            <div
              key={s}
              className="rounded-sm"
              style={{ width: 12, height: 12, background: SCORE_COLORS[s], border: '1px solid rgba(255,255,255,0.04)' }}
            />
          ))}
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>More</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg border text-xs pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y + 6,
            background: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        >
          <p className="font-semibold mb-0.5">{tooltip.day.label}</p>
          <p style={{ color: 'var(--color-text-muted)' }}>{SCORE_LABELS[tooltip.day.score]}</p>
        </div>
      )}
    </div>
  );
}
