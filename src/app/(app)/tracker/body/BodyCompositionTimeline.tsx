'use client';

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Measurement } from './page';

type ChartPoint = {
  label: string;
  leanMass: number | null;
  fatMass: number | null;
  bfPct: number | null;
};

function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildPoints(measurements: Measurement[]): ChartPoint[] {
  // Ascending order for chart
  const asc = [...measurements].reverse();
  return asc
    .map(m => {
      let lean = m.lean_mass_kg ?? null;
      let fat: number | null = null;

      if (m.weight_kg && m.body_fat_pct != null) {
        fat = parseFloat((m.weight_kg * (m.body_fat_pct / 100)).toFixed(1));
        if (!lean) lean = parseFloat((m.weight_kg - fat).toFixed(1));
      } else if (m.weight_kg && lean) {
        fat = parseFloat((m.weight_kg - lean).toFixed(1));
      }

      if (lean == null && fat == null && m.body_fat_pct == null) return null;

      return {
        label: shortDate(m.date),
        leanMass: lean,
        fatMass: fat,
        bfPct: m.body_fat_pct ?? null,
      };
    })
    .filter((p): p is ChartPoint => p !== null);
}

function StatDelta({
  label,
  first,
  last,
  unit,
  lowerIsBetter,
}: {
  label: string;
  first: number;
  last: number;
  unit: string;
  lowerIsBetter?: boolean;
}) {
  const delta = parseFloat((last - first).toFixed(1));
  const isImprovement = lowerIsBetter ? delta < 0 : delta > 0;
  const color = delta === 0
    ? 'var(--color-text-secondary)'
    : isImprovement
      ? '#4ade80'
      : '#f87171';

  return (
    <div className="rounded-xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </p>
      <p className="text-xl font-black tabular-nums" style={{ color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
        {last}{unit}
      </p>
      {first !== last && (
        <p className="text-xs font-semibold mt-0.5" style={{ color }}>
          {delta > 0 ? '+' : ''}{delta}{unit} since first
        </p>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      padding: '10px 14px',
      fontSize: 12,
    }}>
      <p style={{ color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {p.value != null ? (p.name === 'BF%' ? `${p.value}%` : `${p.value} kg`) : '—'}
        </p>
      ))}
    </div>
  );
}

export function BodyCompositionTimeline({ measurements }: { measurements: Measurement[] }) {
  const points = buildPoints(measurements);

  if (points.length < 2) {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Body Composition Timeline</p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Log at least 2 entries with weight + body fat % to see your composition trend.
        </p>
      </div>
    );
  }

  // Delta stats (first vs last)
  const first = points[0];
  const last  = points[points.length - 1];
  const hasLean = first.leanMass != null && last.leanMass != null;
  const hasFat  = first.fatMass  != null && last.fatMass  != null;
  const hasBf   = first.bfPct    != null && last.bfPct    != null;
  const hasBoth = points.some(p => p.leanMass != null && p.fatMass != null);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>Body Composition Timeline</h2>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {points.length} data point{points.length !== 1 ? 's' : ''} · lean mass vs fat mass
        </p>
      </div>

      {/* Delta stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {hasBf && (
          <StatDelta label="Body Fat" first={first.bfPct!} last={last.bfPct!} unit="%" lowerIsBetter />
        )}
        {hasLean && (
          <StatDelta label="Lean Mass" first={first.leanMass!} last={last.leanMass!} unit=" kg" />
        )}
        {hasFat && (
          <StatDelta label="Fat Mass" first={first.fatMass!} last={last.fatMass!} unit=" kg" lowerIsBetter />
        )}
      </div>

      {/* Stacked area chart: lean + fat mass */}
      {hasBoth && (
        <div className="rounded-2xl border p-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Mass Breakdown (kg)</p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={points} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="leanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb923c" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#fb923c" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}kg`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: 'var(--color-text-muted)', paddingTop: 8 }}
              />
              <Area
                type="monotone"
                dataKey="fatMass"
                name="Fat"
                stackId="comp"
                stroke="#fb923c"
                fill="url(#fatGrad)"
                strokeWidth={2}
                connectNulls
              />
              <Area
                type="monotone"
                dataKey="leanMass"
                name="Lean"
                stackId="comp"
                stroke="#38bdf8"
                fill="url(#leanGrad)"
                strokeWidth={2}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* BF% trend line */}
      {hasBf && (
        <div className="rounded-2xl border p-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Body Fat % Trend</p>
          <ResponsiveContainer width="100%" height={140}>
            <ComposedChart data={points} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}%`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '8px 12px', fontSize: 11 }}>
                      <p style={{ color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</p>
                      <p style={{ color: '#a78bfa', fontWeight: 700 }}>{payload[0]?.value}% BF</p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="bfPct"
                name="BF%"
                stroke="#a78bfa"
                fill="url(#bfGrad)"
                strokeWidth={2}
                dot={{ r: 3, fill: '#a78bfa' }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
