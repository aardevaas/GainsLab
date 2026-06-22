'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type SetLog = {
  exerciseName: string;
  exerciseId: string;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
};

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
      }))
    );
  }

  revalidatePath('/tracker/habits');
  revalidatePath('/workouts');
  redirect('/workouts');
}
