'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateWorkoutCompetitions } from '@/app/(app)/community/competitions/actions';
import { recomputeDailyMetrics } from '@/lib/gains/engine';
import { estimateOneRepMax } from '@/lib/workouts/training';

type SetLog = {
  exerciseName: string;
  exerciseId: string;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  rpe?: number | null;
  isWarmup?: boolean;
};

export type ExerciseHistory = {
  /** The matching sets from the most recent session this exercise appeared in. */
  lastSets: { reps: number | null; weightKg: number | null }[];
  lastPerformedAt: string | null;
  bestE1rm: number;
  bestWeightKg: number;
};

/**
 * Per-exercise history + personal bests for the current user, used to show
 * "previous" ghosts and detect PRs while logging. Derived from session_sets —
 * no dedicated PR table needed.
 */
export async function getExerciseHistory(
  exerciseIds: string[],
): Promise<Record<string, ExerciseHistory>> {
  const out: Record<string, ExerciseHistory> = {};
  if (exerciseIds.length === 0) return out;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return out;

  // Recent completed sessions (id + date), newest first.
  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('id,date')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(120);

  if (!sessions || sessions.length === 0) return out;

  const dateById = new Map(sessions.map((s) => [s.id, s.date]));
  const { data: sets } = await supabase
    .from('session_sets')
    .select('session_id,exercise_id,set_number,reps,weight_kg')
    .in('session_id', sessions.map((s) => s.id))
    .in('exercise_id', exerciseIds);

  if (!sets) return out;

  for (const id of exerciseIds) {
    const rows = sets.filter((s) => s.exercise_id === id);
    if (rows.length === 0) continue;

    let bestE1rm = 0;
    let bestWeightKg = 0;
    for (const r of rows) {
      const w = r.weight_kg ?? 0;
      const reps = r.reps ?? 0;
      bestE1rm = Math.max(bestE1rm, estimateOneRepMax(w, reps));
      bestWeightKg = Math.max(bestWeightKg, w);
    }

    // Most recent session containing this exercise.
    const latestDate = rows
      .map((r) => dateById.get(r.session_id) ?? '')
      .sort()
      .at(-1) ?? null;
    const lastSets = rows
      .filter((r) => (dateById.get(r.session_id) ?? '') === latestDate)
      .sort((a, b) => a.set_number - b.set_number)
      .map((r) => ({ reps: r.reps, weightKg: r.weight_kg }));

    out[id] = { lastSets, lastPerformedAt: latestDate, bestE1rm, bestWeightKg };
  }

  return out;
}

export async function completeSession(
  planId: string | null,
  sets: SetLog[],
  durationMinutes: number,
  notes: string
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];

  const { data: session, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: user.id,
      plan_id: planId,
      date: today,
      duration_minutes: durationMinutes || null,
      calories_burned: null,
      notes: notes || null,
      completed: true,
    })
    .select('id')
    .single();

  if (error || !session) throw new Error('Failed to save session');

  if (sets.length > 0) {
    await supabase.from('session_sets').insert(
      sets.map(s => ({
        session_id: session.id,
        exercise_id: s.exerciseId,
        exercise_name: s.exerciseName,
        set_number: s.setNumber,
        reps: s.reps,
        weight_kg: s.weightKg,
        duration_seconds: null,
        notes: null,
        rpe: s.rpe ?? null,
        is_warmup: s.isWarmup ?? false,
      }))
    );
  }

  // Update scores for any workout-type competitions the user has joined
  await updateWorkoutCompetitions(user.id);
  await recomputeDailyMetrics(user.id).catch(() => {});

  revalidatePath('/tracker/habits');
  revalidatePath('/community/leaderboard');
  revalidatePath('/workouts');
  redirect('/workouts');
}
