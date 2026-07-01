import Link from 'next/link';
import { FlaskConical } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import {
  SUPPLEMENT_GOALS,
  EVIDENCE_LEVELS,
  EVIDENCE_LABELS,
  EVIDENCE_COLORS,
  PRICE_LABELS,
  filterSupplements,
  type Supplement,
  type SupplementGoal,
  type EvidenceLevel,
} from '@/lib/supplements/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Supplement Advisor' };

type Props = {
  searchParams: Promise<{ goal?: string; evidence?: string }>;
};

export default async function SupplementsPage({ searchParams }: Props) {
  const { goal: goalParam, evidence: evidenceParam } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from('supplements')
    .select('*')
    .eq('is_published', true)
    .order('evidence')
    .order('name');

  const allSupplements = (data ?? []) as unknown as Supplement[];

  const activeGoal = SUPPLEMENT_GOALS.find(g => g.id === goalParam)?.id ?? null;
  const activeEvidence = EVIDENCE_LEVELS.find(e => e === evidenceParam) ?? null;

  const supplements = filterSupplements(allSupplements, activeGoal as SupplementGoal | null, activeEvidence);
  const totalCount = allSupplements.length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-8 py-5 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="flex items-center gap-3 mb-1">
          <FlaskConical size={18} style={{ color: 'var(--color-accent)' }} />
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Supplement Advisor
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)', marginLeft: '30px' }}>
          {totalCount} supplements ranked by evidence quality
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-4xl">
        {/* Evidence legend */}
        <div
          className="rounded-2xl p-4 mb-6 border flex flex-wrap gap-4"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {EVIDENCE_LEVELS.map(level => (
            <div key={level} className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded flex items-center justify-center text-xs font-black"
                style={{ background: `${EVIDENCE_COLORS[level]}20`, color: EVIDENCE_COLORS[level] }}
              >
                {level}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {EVIDENCE_LABELS[level]}
              </span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Goal
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={activeEvidence ? `/supplements?evidence=${activeEvidence}` : '/supplements'}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: !activeGoal ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: !activeGoal ? '#0a0c0f' : 'var(--color-text-secondary)',
                  border: '1px solid',
                  borderColor: !activeGoal ? 'transparent' : 'var(--color-border)',
                }}
              >
                All Goals
              </Link>
              {SUPPLEMENT_GOALS.map(g => {
                const params = new URLSearchParams();
                if (g.id !== activeGoal) params.set('goal', g.id);
                if (activeEvidence) params.set('evidence', activeEvidence);
                const href = `/supplements${params.toString() ? `?${params}` : ''}`;
                const isActive = activeGoal === g.id;
                return (
                  <Link
                    key={g.id}
                    href={href}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      background: isActive ? 'var(--color-accent)' : 'var(--color-surface)',
                      color: isActive ? '#0a0c0f' : 'var(--color-text-secondary)',
                      border: '1px solid',
                      borderColor: isActive ? 'transparent' : 'var(--color-border)',
                    }}
                  >
                    {g.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Minimum Evidence
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={activeGoal ? `/supplements?goal=${activeGoal}` : '/supplements'}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: !activeEvidence ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: !activeEvidence ? '#0a0c0f' : 'var(--color-text-secondary)',
                  border: '1px solid',
                  borderColor: !activeEvidence ? 'transparent' : 'var(--color-border)',
                }}
              >
                Show All
              </Link>
              {EVIDENCE_LEVELS.map(level => {
                const params = new URLSearchParams();
                if (level !== activeEvidence) params.set('evidence', level);
                if (activeGoal) params.set('goal', activeGoal);
                const href = `/supplements${params.toString() ? `?${params}` : ''}`;
                const isActive = activeEvidence === level;
                return (
                  <Link
                    key={level}
                    href={href}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      background: isActive ? EVIDENCE_COLORS[level] : 'var(--color-surface)',
                      color: isActive ? '#0a0c0f' : EVIDENCE_COLORS[level],
                      border: '1px solid',
                      borderColor: isActive ? 'transparent' : `${EVIDENCE_COLORS[level]}40`,
                    }}
                  >
                    {EVIDENCE_LABELS[level]}+
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
          {supplements.length} of {totalCount} supplements shown
        </p>

        {/* Supplement cards */}
        <div className="flex flex-col gap-3">
          {supplements.map(s => (
            <div
              key={s.id}
              className="rounded-2xl p-5 border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black"
                    style={{
                      background: `${EVIDENCE_COLORS[s.evidence]}20`,
                      color: EVIDENCE_COLORS[s.evidence],
                    }}
                  >
                    {s.evidence}
                  </span>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                    {s.name}
                  </h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                  >
                    {s.category}
                  </span>
                </div>
                <span
                  className="shrink-0 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                >
                  {PRICE_LABELS[s.price_tier]}
                </span>
              </div>

              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                {s.summary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  className="rounded-xl p-3 text-xs"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                >
                  <span className="font-semibold block mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Dosage</span>
                  <span style={{ color: 'var(--color-text)' }}>{s.dosage}</span>
                </div>
                <div
                  className="rounded-xl p-3 text-xs"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                >
                  <span className="font-semibold block mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Timing</span>
                  <span style={{ color: 'var(--color-text)' }}>{s.timing}</span>
                </div>
              </div>

              {s.notes && (
                <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {s.notes}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.goals.map(g => {
                  const goal = SUPPLEMENT_GOALS.find(sg => sg.id === g);
                  return (
                    <span
                      key={g}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(74,222,128,0.08)',
                        color: 'var(--color-accent)',
                        border: '1px solid rgba(74,222,128,0.2)',
                      }}
                    >
                      {goal?.label ?? g}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-xl text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Always consult a qualified healthcare provider before starting any supplementation protocol.
          </p>
        </div>
      </div>
    </div>
  );
}
