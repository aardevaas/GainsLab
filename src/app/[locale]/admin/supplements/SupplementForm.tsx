'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  SUPPLEMENT_GOALS, EVIDENCE_LEVELS, EVIDENCE_LABELS, PRICE_TIERS, PRICE_LABELS,
  type EvidenceLevel, type PriceTier, type Supplement, type SupplementGoal,
} from '@/lib/supplements/types';
import { createSupplement, updateSupplement, type SupplementInput } from './actions';

type Props = {
  supplement?: Supplement;
};

export function SupplementForm({ supplement }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(supplement?.slug ?? '');
  const [name, setName] = useState(supplement?.name ?? '');
  const [category, setCategory] = useState(supplement?.category ?? '');
  const [goals, setGoals] = useState<SupplementGoal[]>(supplement?.goals ?? []);
  const [evidence, setEvidence] = useState<EvidenceLevel>(supplement?.evidence ?? 'B');
  const [summary, setSummary] = useState(supplement?.summary ?? '');
  const [mechanism, setMechanism] = useState(supplement?.mechanism ?? '');
  const [dosage, setDosage] = useState(supplement?.dosage ?? '');
  const [timing, setTiming] = useState(supplement?.timing ?? '');
  const [notes, setNotes] = useState(supplement?.notes ?? '');
  const [priceTier, setPriceTier] = useState<PriceTier>(supplement?.price_tier ?? 'moderate');

  function toggleGoal(g: SupplementGoal) {
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  }

  function handleSave() {
    setError(null);
    const input: SupplementInput = {
      slug, name, category, goals, evidence, summary, mechanism, dosage, timing, notes,
      price_tier: priceTier,
    };

    startTransition(async () => {
      const result = supplement
        ? await updateSupplement(supplement.id, input)
        : await createSupplement(input);

      if (result.error) { setError(result.error); return; }
      router.push('/admin/supplements');
      router.refresh();
    });
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Name">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </Field>
        <Field label="Slug">
          <input
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="creatine"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Category">
          <input
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Performance"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </Field>
        <Field label="Evidence">
          <select
            value={evidence}
            onChange={e => setEvidence(e.target.value as EvidenceLevel)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            {EVIDENCE_LEVELS.map(l => <option key={l} value={l}>{l} — {EVIDENCE_LABELS[l]}</option>)}
          </select>
        </Field>
        <Field label="Price tier">
          <select
            value={priceTier}
            onChange={e => setPriceTier(e.target.value as PriceTier)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            {PRICE_TIERS.map(p => <option key={p} value={p}>{PRICE_LABELS[p]}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Goals">
        <div className="flex flex-wrap gap-2">
          {SUPPLEMENT_GOALS.map(g => {
            const active = goals.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGoal(g.id)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                style={{
                  background: active ? 'var(--color-accent-subtle)' : 'transparent',
                  color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                }}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Summary">
        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
      </Field>

      <Field label="Mechanism">
        <textarea
          value={mechanism}
          onChange={e => setMechanism(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Dosage">
          <input
            value={dosage}
            onChange={e => setDosage(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </Field>
        <Field label="Timing">
          <input
            value={timing}
            onChange={e => setTiming(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </Field>
      </div>

      <Field label="Notes (optional)">
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
      </Field>

      {error && <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
          style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
        >
          {isPending ? 'Saving…' : supplement ? 'Save changes' : 'Create supplement'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/supplements')}
          className="px-5 py-2.5 rounded-xl border text-sm"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
