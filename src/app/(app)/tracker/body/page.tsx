'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { logMeasurement } from '../actions';

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export default function BodyMeasurementsPage() {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    date: todayStr(),
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
  });

  function parseN(v: string): number | null {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
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
      setTimeout(() => setSaved(false), 3000);
    });
  }

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [key]: e.target.value })),
    };
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link href="/tracker" className="size-8 rounded-lg flex items-center justify-center border" style={{ borderColor: 'var(--color-border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
          Body measurements
        </h1>
      </div>

      <div className="flex-1 px-8 py-6 max-w-lg space-y-5">
        <MeasField label="Date" htmlFor="date">
          <input type="date" id="date" {...field('date')} className={inputCls} style={inputStyle} />
        </MeasField>

        <div className="grid grid-cols-2 gap-4">
          <MeasField label="Weight (kg)" htmlFor="weight">
            <input type="number" step="0.1" id="weight" placeholder="75.0" {...field('weight_kg')} className={inputCls} style={inputStyle} />
          </MeasField>
          <MeasField label="Body fat (%)" htmlFor="bf">
            <input type="number" step="0.1" id="bf" placeholder="18.5" {...field('body_fat_pct')} className={inputCls} style={inputStyle} />
          </MeasField>
          <MeasField label="Lean mass (kg)" htmlFor="lean">
            <input type="number" step="0.1" id="lean" placeholder="61.5" {...field('lean_mass_kg')} className={inputCls} style={inputStyle} />
          </MeasField>
          <MeasField label="Neck (cm)" htmlFor="neck">
            <input type="number" step="0.1" id="neck" placeholder="38" {...field('neck_cm')} className={inputCls} style={inputStyle} />
          </MeasField>
          <MeasField label="Waist (cm)" htmlFor="waist">
            <input type="number" step="0.1" id="waist" placeholder="82" {...field('waist_cm')} className={inputCls} style={inputStyle} />
          </MeasField>
          <MeasField label="Chest (cm)" htmlFor="chest">
            <input type="number" step="0.1" id="chest" placeholder="95" {...field('chest_cm')} className={inputCls} style={inputStyle} />
          </MeasField>
          <MeasField label="Hips (cm)" htmlFor="hips">
            <input type="number" step="0.1" id="hips" placeholder="95" {...field('hips_cm')} className={inputCls} style={inputStyle} />
          </MeasField>
          <MeasField label="L. arm (cm)" htmlFor="la">
            <input type="number" step="0.1" id="la" placeholder="35" {...field('left_arm_cm')} className={inputCls} style={inputStyle} />
          </MeasField>
          <MeasField label="R. arm (cm)" htmlFor="ra">
            <input type="number" step="0.1" id="ra" placeholder="35" {...field('right_arm_cm')} className={inputCls} style={inputStyle} />
          </MeasField>
          <MeasField label="L. thigh (cm)" htmlFor="lt">
            <input type="number" step="0.1" id="lt" placeholder="55" {...field('left_thigh_cm')} className={inputCls} style={inputStyle} />
          </MeasField>
          <MeasField label="R. thigh (cm)" htmlFor="rt">
            <input type="number" step="0.1" id="rt" placeholder="55" {...field('right_thigh_cm')} className={inputCls} style={inputStyle} />
          </MeasField>
        </div>

        <MeasField label="Notes" htmlFor="notes">
          <textarea
            id="notes"
            placeholder="Optional notes..."
            rows={2}
            {...field('notes')}
            className={`${inputCls} resize-none`}
            style={inputStyle}
          />
        </MeasField>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={pending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : null}
            {saved ? 'Saved!' : 'Save measurement'}
          </button>
          <Link href="/tracker" className="px-5 py-2.5 rounded-xl border text-sm" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--color-accent)]';
const inputStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderColor: 'var(--color-border)',
  color: 'var(--color-text)',
};

function MeasField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
