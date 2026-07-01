'use client';

import { useState, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Cell,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { DayPoint } from './page';

type Props = {
  days90: DayPoint[];
  tdee: number;
  weightKg: number | null;
  goal: string | null;
  noProfile: boolean;
};

const RANGES = [30, 60, 90] as const;
type Range = typeof RANGES[number];

function avg(arr: number[]): number {
  const nonZero = arr.filter(v => v > 0);
  if (!nonZero.length) return 0;
  return Math.round(nonZero.reduce((s, v) => s + v, 0) / nonZero.length);
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const intake = payload.find(p => p.name === 'intake')?.value ?? 0;
  const burn = payload.find(p => p.name === 'burn')?.value ?? 0;
  const net = payload.find(p => p.name === 'net')?.value ?? 0;
  const target = payload.find(p => p.name === 'target')?.value ?? 0;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      padding: '12px 14px',
      fontSize: 12,
      minWidth: 150,
    }}>
      <p style={{ color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {intake > 0 && <p style={{ color: '#4ade80', marginBottom: 2 }}>Intake: {intake.toLocaleString()} kcal</p>}
      {burn > 0 && <p style={{ color: '#fb923c', marginBottom: 2 }}>Burn: {burn.toLocaleString()} kcal</p>}
      {target > 0 && <p style={{ color: '#60a5fa', marginBottom: 4 }}>Target: {target.toLocaleString()} kcal</p>}
      {(intake > 0 || net !== 0) && (
        <p style={{ color: net > 0 ? '#f87171' : '#4ade80', fontWeight: 700, borderTop: '1px solid var(--color-border)', paddingTop: 4 }}>
          {net > 0 ? '+' : ''}{net.toLocaleString()} kcal
        </p>
      )}
    </div>
  );
}

export function CalorieDashboardClient({ days90, tdee, weightKg, noProfile }: Props) {
  const [range, setRange] = useState<Range>(30);

  const slice = useMemo(() => days90.slice(90 - range), [days90, range]);

  // Thin out x-axis labels based on range
  const labelInterval = range === 30 ? 6 : range === 60 ? 12 : 17;

  // Stats for the selected range
  const loggedDays = slice.filter(d => d.intake > 0);
  const avgIntake = avg(slice.map(d => d.intake));
  const avgBurn   = avg(slice.map(d => d.burn));
  const avgTarget = slice[0]?.target || tdee;
  const avgNet    = avgIntake > 0 ? avgIntake - avgTarget : 0;

  // 30-day projection from current avg net: 7700 kcal ≈ 1 kg
  const projKg    = avgNet !== 0 ? parseFloat((avgNet * 30 / 7700).toFixed(2)) : 0;
  const projLbs   = projKg * 2.2046;

  const hasData = loggedDays.length > 0;
  const hasBurn = slice.some(d => d.burn > 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Range toggle */}
      <div className="flex gap-2">
        {RANGES.map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className="px-4 py-1.5 rounded-xl text-xs font-bold border transition-all"
            style={{
              background: range === r ? 'var(--color-accent)' : 'var(--color-surface)',
              borderColor: range === r ? 'var(--color-accent)' : 'var(--color-border)',
              color: range === r ? '#0a0c0f' : 'var(--color-text-secondary)',
            }}
          >
            {r}d
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Avg Intake', value: avgIntake, unit: 'kcal/day', color: '#4ade80', show: true },
          { label: 'Your Target', value: avgTarget, unit: 'kcal/day', color: '#60a5fa', show: true },
          { label: 'Avg Burn', value: avgBurn, unit: 'kcal/day', color: '#fb923c', show: hasBurn },
          {
            label: avgNet > 50 ? 'Surplus' : avgNet < -50 ? 'Deficit' : 'Balance',
            value: Math.abs(avgNet),
            unit: 'kcal/day',
            color: avgNet > 50 ? '#f87171' : avgNet < -50 ? '#4ade80' : 'var(--color-text-secondary)',
            show: true,
          },
        ].map(card => (
          <div
            key={card.label}
            className="rounded-2xl p-4 border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
              {card.label}
            </p>
            <p className="text-xl font-black tabular-nums" style={{ color: card.color, letterSpacing: '-0.03em' }}>
              {card.show && card.value > 0 ? card.value.toLocaleString() : '—'}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{card.unit}</p>
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div className="rounded-2xl p-5 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            Intake vs Target — Last {range} Days
          </h2>
          <div className="flex items-center gap-4 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#4ade80', display: 'inline-block' }} />
              Intake
            </span>
            {hasBurn && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#fb923c', display: 'inline-block' }} />
                Burn
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 inline-block" style={{ background: '#60a5fa' }} />
              Target
            </span>
          </div>
        </div>

        {!hasData ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Log food to see your calorie history here.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={slice} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                interval={labelInterval}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={avgTarget} stroke="#60a5fa" strokeDasharray="4 4" strokeWidth={1} />
              <Bar dataKey="intake" name="intake" fill="#4ade80" opacity={0.75} radius={[3, 3, 0, 0]} maxBarSize={hasBurn ? 8 : 12} />
              {hasBurn && (
                <Bar dataKey="burn" name="burn" fill="#fb923c" opacity={0.65} radius={[3, 3, 0, 0]} maxBarSize={8} />
              )}
              <Line
                type="monotone"
                dataKey="target"
                name="target"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 3"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Net balance chart */}
      {hasData && (
        <div className="rounded-2xl p-5 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            Daily Net Balance (Surplus / Deficit)
          </h2>
          <ResponsiveContainer width="100%" height={120}>
            <ComposedChart data={slice} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                interval={labelInterval}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v > 0 ? '+' : ''}${Math.round(v / 100) * 100}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const val = payload[0]?.value as number ?? 0;
                  return (
                    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '8px 12px', fontSize: 11 }}>
                      <p style={{ color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</p>
                      <p style={{ color: val > 0 ? '#f87171' : '#4ade80', fontWeight: 700 }}>
                        {val > 0 ? '+' : ''}{val.toLocaleString()} kcal
                      </p>
                    </div>
                  );
                }}
              />
              <ReferenceLine y={0} stroke="var(--color-border)" strokeWidth={1.5} />
              <Bar
                dataKey="net"
                name="net"
                radius={[2, 2, 0, 0]}
                maxBarSize={12}
              >
                {slice.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.net > 0 ? '#f87171' : '#4ade80'}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Projection card */}
      {hasData && (
        <div className="rounded-2xl p-5 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>
            30-Day Weight Projection · at current {range}d pace
          </p>
          {Math.abs(projKg) < 0.05 ? (
            <div>
              <p className="text-xl font-black" style={{ color: 'var(--color-text-secondary)' }}>Maintenance</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Intake ≈ target. Weight should stay stable.</p>
            </div>
          ) : (
            <div className="flex items-end gap-6">
              <div>
                <p
                  className="text-3xl font-black"
                  style={{ color: projKg > 0 ? '#f87171' : '#4ade80', letterSpacing: '-0.04em' }}
                >
                  {projKg > 0 ? '+' : '−'}{Math.abs(projKg).toFixed(1)} kg
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {projLbs > 0 ? '+' : '−'}{Math.abs(projLbs).toFixed(1)} lbs · next 30 days
                </p>
              </div>
              {weightKg && (
                <div>
                  <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                    → {(weightKg + projKg).toFixed(1)} kg
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>projected weight</p>
                </div>
              )}
              <div className="flex-1 text-right">
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Avg {avgNet > 0 ? '+' : ''}{avgNet.toLocaleString()} kcal/day
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {Math.abs(avgNet * 30).toLocaleString()} kcal {avgNet > 0 ? 'over' : 'under'} in 30d
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No profile warning */}
      {noProfile && (
        <div
          className="rounded-xl p-4 border text-xs"
          style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.3)', color: '#fbbf24' }}
        >
          Add weight, height, date of birth, sex, and activity level in Profile to unlock your personalised TDEE target.
        </div>
      )}
    </div>
  );
}
