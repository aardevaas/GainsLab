import { Suspense } from 'react';
import Link from 'next/link';
import { searchExercises } from '@/lib/exercises/db';
import { cacheExercises } from '@/lib/exercises/cache';
import { ExerciseMedia } from '@/components/exercises/ExerciseMedia';
import { ExerciseFilters } from '@/components/exercises/ExerciseFilters';
import { FavoriteButton } from '@/components/exercises/FavoriteButton';
import { LEVEL_COLORS, type ExerciseLevel } from '@/lib/exercises/types';
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
          className="w-52 shrink-0 border-r p-4 overflow-y-auto"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <ExerciseFilters q={q} muscle={muscle} equipment={equipment} category={category} level={level} />
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
  const exercises = await searchExercises({ ...filters, query: filters.q, limit: 120 });

  // Build our proprietary exercise DB over time — persist what gets browsed.
  // Best-effort: never blocks or breaks the render.
  await cacheExercises(exercises);

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
          <Link
            key={ex.id}
            href={`/exercises/${encodeURIComponent(ex.id)}`}
            className="card-interactive rom-media rounded-xl border overflow-hidden block"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {/* Range-of-motion media (auto-scrub start → end on hover) */}
            <div className="relative">
              <ExerciseMedia images={ex.images} alt={ex.name} className="h-28" />
              <FavoriteButton exerciseId={ex.id} />
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
                {ex.mechanic && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                    style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)' }}
                  >
                    {ex.mechanic}
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
            </div>
          </Link>
        ))}
      </div>
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
