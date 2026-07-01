'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, TrendingDown, TrendingUp, Minus, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from 'recharts';
import { logMeasurement, deleteMeasurement } from '../actions';
import type { Measurement } from './page';

type Props = {
  measurements: Measurement[];
};

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function parseN(v: string): number | null {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const EMPTY_FORM = {
  date: '',
  weight_kg: '',
  body_fat_pct: '',
  lean_mass_kg: '',
  waist_cm: '',
  chest_cm: '',
  hips_cm: '',
  left_arm_cm: '',
  right_arm_cm: '',
  left_thigh_cm: '',
  right_thigh_cm: '',
  neck_cm: '',
  notes: '',
};

// ─── Sparkline tooltip ────────────────────────────────────────────────────────
function SparkTooltip({ active, payload, unit }: { active?: boolean; payload?: Array<{ value: number }>; unit: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-2 py-1 rounded-lg border text-xs"
      style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
    >
      {payload[0].value}{unit}
    </div>
  );
}

// ─── Single metric trend card ─────────────────────────────────────────────────
function MetricCard({
  label,
  unit,
  data,
  color,
  lowerIsBetter = false,
}: {
  label: string;
  unit: string;
  data: { date: string; value: number }[];
  color: string;
  lowerIsBetter?: boolean;
}) {
  if (data.length === 0) return null;
  const latest = data[data.length - 1].value;
  const prev = data.length > 1 ? data[data.length - 2].value : null;
  const delta = prev !== null ? latest - prev : null;
  const isGood = delta === null ? null : lowerIsBetter ? delta < 0 : delta > 0;

  const chartData = data.map(d => ({ v: d.value }));

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
        {delta !== null && (
          <span
            className="flex items-center gap-0.5 text-[10px] font-semibold"
            style={{ color: isGood ? '#4ade80' : isGood === false ? '#f87171' : 'var(--color-text-muted)' }}
          >
            {delta > 0 ? <TrendingUp size={11} /> : delta < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}{unit}
          </span>
        )}
      </div>
      <p className="text-xl font-bold mb-3" style={{ color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
        {latest}{unit}
      </p>
      <ResponsiveContainer width="100%" height={40}>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: color }}
          />
          <Tooltip content={(p) => <SparkTooltip active={p.active} payload={p.payload as unknown as Array<{ value: number }>} unit={unit} />} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Log form ─────────────────────────────────────────────────────────────────
function LogForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, date: todayStr() });
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [key]: e.target.value })),
    };
  }

  function handleSave() {
    startTransition(async () => {
      await logMeasurement({
        date: form.date,
        weight_kg: parseN(form.weight_kg),
        body_fat_pct: parseN(form.body_fat_pct),
        lean_mass_kg: parseN(form.lean_mass_kg),
        waist_cm: parseN(form.waist_cm),
        chest_cm: parseN(form.chest_cm),
        hips_cm: parseN(form.hips_cm),
        left_arm_cm: parseN(form.left_arm_cm),
        right_arm_cm: parseN(form.right_arm_cm),
        left_thigh_cm: parseN(form.left_thigh_cm),
        right_thigh_cm: parseN(form.right_thigh_cm),
        neck_cm: parseN(form.neck_cm),
        notes: form.notes || null,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onSaved();
      }, 1200);
    });
  }

  return (
    <div
      className="rounded-xl border p-5 space-y-4"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <MeasField label="Date" htmlFor="f-date">
        <input type="date" id="f-date" {...field('date')} className={inputCls} style={inputStyle} />
      </MeasField>

      <div className="grid grid-cols-2 gap-3">
        <MeasField label="Weight (kg)" htmlFor="f-weight">
          <input type="number" step="0.1" id="f-weight" placeholder="75.0" {...field('weight_kg')} className={inputCls} style={inputStyle} />
        </MeasField>
        <MeasField label="Body fat (%)" htmlFor="f-bf">
          <input type="number" step="0.1" id="f-bf" placeholder="18.5" {...field('body_fat_pct')} className={inputCls} style={inputStyle} />
        </MeasField>
        <MeasField label="Lean mass (kg)" htmlFor="f-lean">
          <input type="number" step="0.1" id="f-lean" placeholder="61.5" {...field('lean_mass_kg')} className={inputCls} style={inputStyle} />
        </MeasField>
        <MeasField label="Neck (cm)" htmlFor="f-neck">
          <input type="number" step="0.1" id="f-neck" placeholder="38" {...field('neck_cm')} className={inputCls} style={inputStyle} />
        </MeasField>
        <MeasField label="Waist (cm)" htmlFor="f-waist">
          <input type="number" step="0.1" id="f-waist" placeholder="82" {...field('waist_cm')} className={inputCls} style={inputStyle} />
        </MeasField>
        <MeasField label="Chest (cm)" htmlFor="f-chest">
          <input type="number" step="0.1" id="f-chest" placeholder="95" {...field('chest_cm')} className={inputCls} style={inputStyle} />
        </MeasField>
        <MeasField label="Hips (cm)" htmlFor="f-hips">
          <input type="number" step="0.1" id="f-hips" placeholder="95" {...field('hips_cm')} className={inputCls} style={inputStyle} />
        </MeasField>
        <MeasField label="L. arm (cm)" htmlFor="f-la">
          <input type="number" step="0.1" id="f-la" placeholder="35" {...field('left_arm_cm')} className={inputCls} style={inputStyle} />
        </MeasField>
        <MeasField label="R. arm (cm)" htmlFor="f-ra">
          <input type="number" step="0.1" id="f-ra" placeholder="35" {...field('right_arm_cm')} className={inputCls} style={inputStyle} />
        </MeasField>
        <MeasField label="L. thigh (cm)" htmlFor="f-lt">
          <input type="number" step="0.1" id="f-lt" placeholder="55" {...field('left_thigh_cm')} className={inputCls} style={inputStyle} />
        </MeasField>
        <MeasField label="R. thigh (cm)" htmlFor="f-rt">
          <input type="number" step="0.1" id="f-rt" placeholder="55" {...field('right_thigh_cm')} className={inputCls} style={inputStyle} />
        </MeasField>
      </div>

      <MeasField label="Notes" htmlFor="f-notes">
        <textarea
          id="f-notes"
          placeholder="Optional notes..."
          rows={2}
          {...field('notes')}
          className={`${inputCls} resize-none`}
          style={inputStyle}
        />
      </MeasField>

      <button
        onClick={handleSave}
        disabled={pending || saved}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
        style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : null}
        {saved ? 'Saved!' : 'Save measurement'}
      </button>
    </div>
  );
}

// ─── Main client ──────────────────────────────────────────────────────────────
export function BodyMeasurementsClient({ measurements }: Props) {
  const [showForm, setShowForm] = useState(measurements.length === 0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));

  function metricSeries(key: keyof Measurement) {
    return sorted
      .filter(m => m[key] !== null)
      .map(m => ({ date: m.date, value: m[key] as number }));
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      await deleteMeasurement(id);
      setDeletingId(null);
    });
  }

  const weightData = metricSeries('weight_kg');
  const bfData = metricSeries('body_fat_pct');
  const leanData = metricSeries('lean_mass_kg');
  const waistData = metricSeries('waist_cm');
  const chestData = metricSeries('chest_cm');
  const hipsData = metricSeries('hips_cm');
  const armData = metricSeries('left_arm_cm');

  const hasAnyData = measurements.length > 0;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Log toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          {hasAnyData ? `${measurements.length} entr${measurements.length === 1 ? 'y' : 'ies'} (90 days)` : 'No measurements yet'}
        </p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: showForm ? 'var(--color-surface-elevated)' : 'var(--color-accent)', color: showForm ? 'var(--color-text-secondary)' : '#0a0c0f' }}
        >
          <Plus size={14} />
          {showForm ? 'Hide form' : 'Log measurement'}
        </button>
      </div>

      {/* Log form */}
      {showForm && <LogForm onSaved={() => setShowForm(false)} />}

      {/* Metric trend cards */}
      {hasAnyData && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {weightData.length > 0 && <MetricCard label="Weight" unit=" kg" data={weightData} color="#4ade80" lowerIsBetter={false} />}
          {bfData.length > 0 && <MetricCard label="Body fat" unit="%" data={bfData} color="#a78bfa" lowerIsBetter={true} />}
          {leanData.length > 0 && <MetricCard label="Lean mass" unit=" kg" data={leanData} color="#38bdf8" lowerIsBetter={false} />}
          {waistData.length > 0 && <MetricCard label="Waist" unit=" cm" data={waistData} color="#fb923c" lowerIsBetter={true} />}
          {chestData.length > 0 && <MetricCard label="Chest" unit=" cm" data={chestData} color="#facc15" lowerIsBetter={false} />}
          {hipsData.length > 0 && <MetricCard label="Hips" unit=" cm" data={hipsData} color="#f472b6" lowerIsBetter={true} />}
          {armData.length > 0 && <MetricCard label="Arm" unit=" cm" data={armData} color="#34d399" lowerIsBetter={false} />}
        </div>
      )}

      {/* History table */}
      {hasAnyData && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div
            className="px-4 py-2.5 border-b text-xs font-semibold"
            style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            History
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {[...measurements].sort((a, b) => b.date.localeCompare(a.date)).map(m => (
              <div
                key={m.id}
                className="px-4 py-3 flex items-start justify-between gap-4"
                style={{ background: 'var(--color-surface)' }}
              >
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    {formatDate(m.date)}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                    {m.weight_kg !== null && <Chip label="Weight" value={`${m.weight_kg} kg`} />}
                    {m.body_fat_pct !== null && <Chip label="BF%" value={`${m.body_fat_pct}%`} />}
                    {m.lean_mass_kg !== null && <Chip label="Lean" value={`${m.lean_mass_kg} kg`} />}
                    {m.waist_cm !== null && <Chip label="Waist" value={`${m.waist_cm} cm`} />}
                    {m.chest_cm !== null && <Chip label="Chest" value={`${m.chest_cm} cm`} />}
                    {m.hips_cm !== null && <Chip label="Hips" value={`${m.hips_cm} cm`} />}
                    {m.left_arm_cm !== null && <Chip label="L arm" value={`${m.left_arm_cm} cm`} />}
                    {m.right_arm_cm !== null && <Chip label="R arm" value={`${m.right_arm_cm} cm`} />}
                    {m.left_thigh_cm !== null && <Chip label="L thigh" value={`${m.left_thigh_cm} cm`} />}
                    {m.right_thigh_cm !== null && <Chip label="R thigh" value={`${m.right_thigh_cm} cm`} />}
                    {m.neck_cm !== null && <Chip label="Neck" value={`${m.neck_cm} cm`} />}
                  </div>
                  {m.notes && (
                    <p className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>{m.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={deletingId === m.id}
                  className="shrink-0 size-7 flex items-center justify-center rounded-lg border disabled:opacity-40"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                  title="Delete entry"
                >
                  {deletingId === m.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : <Trash2 size={12} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasAnyData && !showForm && (
        <div
          className="rounded-xl border p-12 flex flex-col items-center justify-center text-center"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>No measurements yet</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Log your first measurement to start tracking trends.</p>
        </div>
      )}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-[var(--color-accent)] transition-colors';
const inputStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderColor: 'var(--color-border)',
  color: 'var(--color-text)',
};

function MeasField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-xs">
      <span style={{ color: 'var(--color-text-muted)' }}>{label} </span>
      <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{value}</span>
    </span>
  );
}
