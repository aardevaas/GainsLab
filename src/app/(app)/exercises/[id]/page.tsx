import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getExerciseById } from '@/lib/exercises/db';
import { cacheExercises } from '@/lib/exercises/cache';
import { ExerciseMedia } from '@/components/exercises/ExerciseMedia';
import { MuscleVisualizer } from '@/components/exercises/MuscleVisualizer';
import { AddToPlan } from '@/components/exercises/AddToPlan';
import { LEVEL_COLORS, type ExerciseLevel } from '@/lib/exercises/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ex = await getExerciseById(decodeURIComponent(id));
  return { title: ex ? ex.name : 'Exercise' };
}

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ex = await getExerciseById(decodeURIComponent(id));
  if (!ex) notFound();

  // Persist this exercise into our cache (best-effort).
  await cacheExercises([ex]);

  const levelColor = LEVEL_COLORS[ex.level as ExerciseLevel] ?? 'var(--color-text)';

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div
        className="px-8 py-5 border-b flex items-center gap-4"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <Link
          href="/exercises"
          className="size-8 rounded-lg flex items-center justify-center border shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            {ex.name}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize"
              style={{ color: levelColor, background: `${levelColor}15` }}
            >
              {ex.level}
            </span>
            {ex.equipment && (
              <span className="text-[11px] capitalize" style={{ color: 'var(--color-text-muted)' }}>
                {ex.equipment}
              </span>
            )}
            <span className="text-[11px] capitalize" style={{ color: 'var(--color-text-muted)' }}>
              · {ex.category}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
        {/* Left: media + instructions */}
        <div className="space-y-6">
          <ExerciseMedia
            images={ex.images}
            alt={ex.name}
            autoPlay
            className="h-72 rounded-2xl border"
          />

          <div className="flex flex-wrap gap-1.5">
            {ex.primaryMuscles.map((m) => (
              <span
                key={m}
                className="text-[11px] px-2 py-1 rounded-full capitalize"
                style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
              >
                {m}
              </span>
            ))}
            {ex.secondaryMuscles.map((m) => (
              <span
                key={m}
                className="text-[11px] px-2 py-1 rounded-full capitalize"
                style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)' }}
              >
                {m}
              </span>
            ))}
          </div>

          {ex.instructions.length > 0 && (
            <div>
              <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                Instructions
              </h2>
              <ol className="space-y-2.5">
                {ex.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    <span
                      className="shrink-0 size-5 flex items-center justify-center rounded-full text-[11px] font-bold mt-0.5"
                      style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text)' }}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Right: muscle visualizer + add to plan */}
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>
              Muscles worked
            </h2>
            <MuscleVisualizer
              primaryMuscles={ex.primaryMuscles}
              secondaryMuscles={ex.secondaryMuscles}
            />
          </div>
          <AddToPlan exerciseId={ex.id} exerciseName={ex.name} />
        </div>
      </div>
    </div>
  );
}
