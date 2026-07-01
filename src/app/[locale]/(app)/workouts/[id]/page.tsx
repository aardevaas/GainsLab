import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Dumbbell } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { WorkoutDayBuilder } from './WorkoutDayBuilder';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Workout Plan' };

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [planRes, daysRes] = await Promise.all([
    supabase.from('workout_plans').select('*').eq('id', id).eq('user_id', user!.id).single(),
    supabase.from('workout_days').select('*').eq('plan_id', id).order('order'),
  ]);

  if (!planRes.data) notFound();
  const plan = planRes.data;
  const days = daysRes.data ?? [];

  // Fetch exercises for each day
  const dayIds = days.map(d => d.id);
  const exercisesRes = dayIds.length
    ? await supabase
        .from('workout_exercises')
        .select('*')
        .in('day_id', dayIds)
        .order('order')
    : { data: [] };

  type ExRow = {
    id: string; day_id: string; exercise_id: string; exercise_name: string;
    sets: number; reps: number | null; duration_seconds: number | null;
    weight_kg: number | null; rest_seconds: number; notes: string | null; order: number;
  };
  const exercisesByDay: Record<string, ExRow[]> = {};
  for (const ex of (exercisesRes.data ?? []) as ExRow[]) {
    (exercisesByDay[ex.day_id] ??= []).push(ex);
  }

  const daysWithExercises = days.map(d => ({
    id: d.id,
    day_number: d.day_number,
    name: d.name,
    exercises: exercisesByDay[d.id] ?? [],
  }));

  const totalExercises = daysWithExercises.reduce((acc, d) => acc + d.exercises.length, 0);

  return (
    <div className="flex flex-col min-h-full">
      <div
        className="px-8 py-5 border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <div className="flex items-center gap-4 mb-3">
          <Link
            href="/workouts"
            className="size-8 rounded-lg flex items-center justify-center border"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <div className="flex-1">
            <h1
              className="text-xl font-bold"
              style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}
            >
              {plan.name}
            </h1>
            {plan.description && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {plan.description}
              </p>
            )}
          </div>
          <Link
            href={`/workouts/log?plan=${plan.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
          >
            Start session
          </Link>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <span className="flex items-center gap-1.5">
            <Calendar size={12} /> {plan.days_per_week}x / week
          </span>
          <span className="flex items-center gap-1.5">
            <Dumbbell size={12} /> {totalExercises} exercise{totalExercises !== 1 ? 's' : ''}
          </span>
          {plan.difficulty && (
            <span className="capitalize">{plan.difficulty}</span>
          )}
          {plan.goal && (
            <span>{plan.goal}</span>
          )}
        </div>
      </div>

      <div className="flex-1 px-8 py-6 max-w-2xl">
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Click a day name to rename it. Use "Add exercise" to build each day.
        </p>
        <WorkoutDayBuilder days={daysWithExercises} />
      </div>
    </div>
  );
}
