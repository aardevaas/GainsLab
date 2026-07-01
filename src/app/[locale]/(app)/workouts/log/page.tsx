import Link from 'next/link';
import { ArrowLeft, Dumbbell } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SessionLogger } from './SessionLogger';
import { getExerciseHistory } from './actions';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Log Session' };

type SearchParams = Promise<{ plan?: string }>;

export default async function WorkoutLogPage({ searchParams }: { searchParams: SearchParams }) {
  const { plan: planId } = await searchParams;

  if (!planId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-4 px-8">
        <Dumbbell size={32} style={{ color: 'var(--color-text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Select a plan to log a session</p>
        <Link href="/workouts" className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}>
          Go to workouts
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [planRes, daysRes] = await Promise.all([
    supabase.from('workout_plans').select('*').eq('id', planId).eq('user_id', user!.id).single(),
    supabase.from('workout_days').select('*').eq('plan_id', planId).order('order'),
  ]);

  if (!planRes.data) notFound();
  const plan = planRes.data;
  const days = daysRes.data ?? [];

  const dayIds = days.map(d => d.id);
  const exercisesRes = dayIds.length
    ? await supabase.from('workout_exercises').select('*').in('day_id', dayIds).order('order')
    : { data: [] };

  const exercisesByDay: Record<string, typeof exercisesRes.data> = {};
  for (const ex of exercisesRes.data ?? []) {
    (exercisesByDay[ex.day_id] ??= []).push(ex);
  }

  const daysWithExercises = days.map(d => ({
    id: d.id,
    name: d.name,
    exercises: (exercisesByDay[d.id] ?? []).map(e => ({
      id: e.id,
      exercise_id: e.exercise_id,
      exercise_name: e.exercise_name,
      sets: e.sets,
      reps: e.reps,
      rest_seconds: e.rest_seconds,
    })),
  }));

  // Per-exercise history + PRs for "previous" ghosts and PR detection.
  const exerciseIds = [
    ...new Set((exercisesRes.data ?? []).map(e => e.exercise_id)),
  ];
  const history = await getExerciseHistory(exerciseIds);

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link href={`/workouts/${planId}`} className="size-8 rounded-lg flex items-center justify-center border" style={{ borderColor: 'var(--color-border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Log session
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{plan.name}</p>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 max-w-2xl">
        <SessionLogger planId={planId} days={daysWithExercises} history={history} />
      </div>
    </div>
  );
}
