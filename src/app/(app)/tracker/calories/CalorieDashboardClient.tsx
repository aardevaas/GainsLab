'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

type DayData = {
  date: string;
  intake: number;
  tdee: number;
};

type Props = {
  data: DayData[];
  tdee: number;
  avgIntake: number;
  avgDelta: number;
  projectedWeightKg: number;
};

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const intake = payload.find(p => p.name === 'intake')?.value ?? 0;
  const tdee = payload.find(p => p.name === 'tdee')?.value ?? 0;
  const delta = intake - tdee;
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '12px 14px',
        fontSize: '12px',
      }}
    >
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 600 }}>{label}</p>
      <p style={{ color: '#4ade80', marginBottom: '2px' }}>Intake: {intake.toLocaleString()} kcal</p>
      <p style={{ color: '#60a5fa', marginBottom: '4px' }}>TDEE: {tdee.toLocaleString()} kcal</p>
      <p style={{ color: delta >= 0 ? '#f87171' : '#4ade80', fontWeight: 700 }}>
        {delta >= 0 ? '+' : ''}{delta.toLocaleString()} kcal
      </p>
    </div>
  );
}

function ProjectionCard({ avgDelta, projectedWeightKg }: { avgDelta: number; projectedWeightKg: number }) {
  const isDeficit = avgDelta < -50;
  const isSurplus = avgDelta > 50;
  const weightLbs = Math.abs(projectedWeightKg) * 2.2046;
  const direction = avgDelta >= 0 ? 'gain' : 'lose';
  const color = avgDelta >= 0 ? '#f87171' : '#4ade80';

  if (!isDeficit && !isSurplus) {
    return (
      <div className="rounded-xl p-4 border text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Maintenance</p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Calories in ≈ calories out. Weight should stay stable.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
        30-Day Projection
      </p>
      <p className="text-2xl font-black mb-1" style={{ color, letterSpacing: '-0.03em' }}>
        {direction === 'lose' ? '−' : '+'}{projectedWeightKg.toFixed(1)} kg
      </p>
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        ({weightLbs.toFixed(1)} lbs) at current pace
      </p>
    </div>
  );
}

export function CalorieDashboardClient({ data, tdee, avgIntake, avgDelta, projectedWeightKg }: Props) {
  const hasData = data.some(d => d.intake > 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="rounded-2xl p-4 border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Avg Intake
          </p>
          <p className="text-2xl font-black" style={{ color: '#4ade80', letterSpacing: '-0.03em' }}>
            {avgIntake > 0 ? avgIntake.toLocaleString() : '—'}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>kcal / day</p>
        </div>

        <div
          className="rounded-2xl p-4 border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Your TDEE
          </p>
          <p className="text-2xl font-black" style={{ color: '#60a5fa', letterSpacing: '-0.03em' }}>
            {tdee > 0 ? tdee.toLocaleString() : '—'}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>kcal / day</p>
        </div>

        <div
          className="rounded-2xl p-4 border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Avg Delta
          </p>
          <p
            className="text-2xl font-black"
            style={{
              color: avgDelta > 50 ? '#f87171' : avgDelta < -50 ? '#4ade80' : 'var(--color-text-secondary)',
              letterSpacing: '-0.03em',
            }}
          >
            {avgDelta === 0 ? '—' : `${avgDelta > 0 ? '+' : ''}${avgDelta.toLocaleString()}`}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>kcal / day</p>
        </div>
      </div>

      {/* Chart */}
      <div
        className="rounded-2xl p-5 border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            Intake vs TDEE — Last 30 Days
          </h2>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#4ade80' }} />
              Intake
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-0.5 inline-block" style={{ background: '#60a5fa' }} />
              TDEE
            </span>
          </div>
        </div>

        {!hasData ? (
          <div className="h-40 flex items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Log food to see your calorie history here.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="intake" name="intake" fill="#4ade80" opacity={0.8} radius={[3, 3, 0, 0]} maxBarSize={14} />
              <Line
                type="monotone"
                dataKey="tdee"
                name="tdee"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={false}
                strokeDasharray="6 3"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Projection */}
      <ProjectionCard avgDelta={avgDelta} projectedWeightKg={projectedWeightKg} />

      {/* Context note */}
      {tdee === 0 && (
        <div
          className="rounded-xl p-4 border text-xs"
          style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.3)', color: '#fbbf24' }}
        >
          Add your weight, height, age, sex, and activity level in Profile settings to unlock your personalised TDEE.
        </div>
      )}
    </div>
  );
}
