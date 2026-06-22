import { Suspense } from 'react';
import { searchExercises, exerciseImageUrl } from '@/lib/exercises/db';
import {
  MUSCLE_OPTIONS,
  EQUIPMENT_OPTIONS,
  CATEGORY_OPTIONS,
  LEVEL_OPTIONS,
  LEVEL_COLORS,
  type ExerciseLevel,
} from '@/lib/exercises/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Exercise Library' };

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    muscle?: string;
    equipment?: string;
    category?: string;
    level?: string;
  }>;
}) {
  const params = await searchParams;
  const { q, muscle, equipment, category, level } = params;

  return (
    <div className="flex flex-col min-h-full">
      <div
        className="px-8 py-6 border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <h1
          className="text-xl font-bold"
          style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}
        >
          Exercise Library
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          900+ exercises · instructions · muscle groups
        </p>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Filter sidebar */}
        <aside
          className="w-52 shrink-0 border-r p-4 space-y-5 overflow-y-auto"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <form method="GET">
            {/* Search */}
            <div className="mb-5">
              <input
                type="text"
                name="q"
                defaultValue={q ?? ''}
                placeholder="Search exercises..."
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>

            <FilterSection title="Muscle" name="muscle" options={MUSCLE_OPTIONS} current={muscle} />
            <FilterSection title="Equipment" name="equipment" options={EQUIPMENT_OPTIONS} current={equipment} />
            <FilterSection title="Category" name="category" options={CATEGORY_OPTIONS} current={category} />
            <FilterSection title="Level" name="level" options={LEVEL_OPTIONS} current={level} />

            <button
              type="submit"
              className="w-full mt-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
            >
              Apply filters
            </button>

            {(q || muscle || equipment || category || level) && (
              <a
                href="/exercises"
                className="block w-full mt-2 py-2 rounded-lg text-sm text-center border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                Clear all
              </a>
            )}
          </form>
        </aside>

        {/* Exercise grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={<ExerciseGridSkeleton />}>
            <ExerciseGrid q={q} muscle={muscle} equipment={equipment} category={category} level={level} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function ExerciseGrid(filters: {
  q?: string;
  muscle?: string;
  equipment?: string;
  category?: string;
  level?: string;
}) {
  const exercises = await searchExercises({ ...filters, limit: 120 });

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No exercises match your filters
        </p>
        <a href="/exercises" className="text-xs" style={{ color: 'var(--color-accent)' }}>
          Clear filters
        </a>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
        {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
        {filters.q && ` matching "${filters.q}"`}
      </p>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        {exercises.map(ex => (
          <div
            key={ex.id}
            className="rounded-xl border overflow-hidden"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {/* Thumbnail */}
            <div
              className="relative h-28 overflow-hidden"
              style={{ background: 'var(--color-surface-elevated)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={exerciseImageUrl(ex.id, 0)}
                alt={ex.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={undefined}
              />
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm leading-tight mb-1" style={{ color: 'var(--color-text)' }}>
                {ex.name}
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {ex.primaryMuscles.slice(0, 2).map(m => (
                  <span
                    key={m}
                    className="text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                    style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
                  >
                    {m}
                  </span>
                ))}
                {ex.equipment && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                    style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)' }}
                  >
                    {ex.equipment}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize"
                  style={{
                    color: LEVEL_COLORS[ex.level as ExerciseLevel] ?? '#fff',
                    background: `${LEVEL_COLORS[ex.level as ExerciseLevel] ?? '#fff'}15`,
                  }}
                >
                  {ex.level}
                </span>
                {ex.category && (
                  <span className="text-[10px] capitalize" style={{ color: 'var(--color-text-muted)' }}>
                    {ex.category}
                  </span>
                )}
              </div>

              {/* Instructions preview (first line) */}
              {ex.instructions[0] && (
                <details className="mt-2">
                  <summary
                    className="text-[11px] cursor-pointer"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    Instructions
                  </summary>
                  <ol className="mt-2 space-y-1">
                    {ex.instructions.slice(0, 4).map((step, i) => (
                      <li key={i} className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        {i + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterSection({
  title,
  name,
  options,
  current,
}: {
  title: string;
  name: string;
  options: readonly string[];
  current?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
        {title}
      </p>
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            defaultChecked={current === opt}
            className="accent-[var(--color-accent)]"
          />
          <span className="text-xs capitalize" style={{ color: 'var(--color-text-secondary)' }}>
            {opt}
          </span>
        </label>
      ))}
    </div>
  );
}

function ExerciseGridSkeleton() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border h-48 animate-pulse"
          style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}
        />
      ))}
    </div>
  );
}
