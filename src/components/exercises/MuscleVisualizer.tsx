'use client';

import { useEffect, useState } from 'react';
import Body, { type ExtendedBodyPart } from '@mjcdev/react-body-highlighter';
import { toSlugs, preferredSide } from '@/lib/exercises/muscle-map';

type Mode = 'activation' | 'highlight' | 'heatmap';
type Gender = 'male' | 'female';
type Side = 'front' | 'back';

type Props = {
  primaryMuscles: string[];
  secondaryMuscles: string[];
};

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'activation', label: 'Activation', hint: 'Primary movers + stabilizers' },
  { id: 'highlight', label: 'Highlight', hint: 'All targeted muscles, one color' },
  { id: 'heatmap', label: 'Heatmap', hint: 'Recruitment intensity' },
];

// intensity → color index (intensity 1 = colors[0], 2 = colors[1])
const PALETTE: Record<Mode, string[]> = {
  activation: ['#6ee7b7', '#059669'], // secondary (light) · primary (deep)
  highlight: ['#34d399', '#34d399'],
  heatmap: ['#fbbf24', '#ef4444'], // warm (secondary) · hot (primary)
};

/**
 * Real-time anatomical muscle visualizer. Renders male/female front/back body
 * models and highlights an exercise's primary/secondary muscles in three modes.
 * Activation (default) feeds the exercise's own `primaryMuscles` (deep) and
 * `secondaryMuscles` (light) — data we already have for every exercise.
 */
export function MuscleVisualizer({ primaryMuscles, secondaryMuscles }: Props) {
  const primary = toSlugs(primaryMuscles);
  const secondary = toSlugs(secondaryMuscles).filter((s) => !primary.includes(s));

  const [mode, setMode] = useState<Mode>('activation');
  const [gender, setGender] = useState<Gender>('male');
  const [side, setSide] = useState<Side>(() => preferredSide(primary));

  // The body-highlighter resolves neutral fills from a browser API, so its SSR
  // output differs from the client — render it only after mount to avoid a
  // hydration mismatch (placeholder holds the space, no layout shift).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data: ExtendedBodyPart[] =
    mode === 'highlight'
      ? [...primary, ...secondary].map((slug) => ({ slug, intensity: 1 }))
      : [
          ...secondary.map((slug) => ({ slug, intensity: 1 })),
          ...primary.map((slug) => ({ slug, intensity: 2 })),
        ];

  return (
    <div className="flex flex-col gap-4">
      {/* Mode tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            title={m.hint}
            className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all"
            style={{
              borderColor: mode === m.id ? 'var(--color-accent)' : 'var(--color-border)',
              background: mode === m.id ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
              color: mode === m.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Body model */}
      <div
        className="flex items-center justify-center rounded-xl border py-6"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', minHeight: 500 }}
      >
        {mounted ? (
          <Body
            data={data}
            gender={gender}
            side={side}
            scale={1.25}
            colors={PALETTE[mode]}
            border="var(--color-border-subtle)"
          />
        ) : (
          <div className="animate-pulse rounded-xl" style={{ width: 250, height: 460, background: 'var(--color-surface-elevated)' }} />
        )}
      </div>

      {/* Gender + side toggles */}
      <div className="flex items-center justify-between gap-2">
        <Toggle
          options={[
            { id: 'male', label: 'Male' },
            { id: 'female', label: 'Female' },
          ]}
          value={gender}
          onChange={(v) => setGender(v as Gender)}
        />
        <Toggle
          options={[
            { id: 'front', label: 'Front' },
            { id: 'back', label: 'Back' },
          ]}
          value={side}
          onChange={(v) => setSide(v as Side)}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
        <Legend color={PALETTE[mode][1]} label={mode === 'highlight' ? 'Targeted' : 'Primary'} />
        {mode !== 'highlight' && secondary.length > 0 && (
          <Legend color={PALETTE[mode][0]} label="Secondary" />
        )}
      </div>
    </div>
  );
}

function Toggle({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex rounded-lg border overflow-hidden"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className="px-3 py-1.5 text-xs font-semibold transition-colors"
          style={{
            background: value === o.id ? 'var(--color-accent)' : 'var(--color-surface)',
            color: value === o.id ? '#0a0c0f' : 'var(--color-text-secondary)',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
