'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createPlan(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  const daysPerWeek = Number(formData.get('days_per_week') ?? 3);
  const goal = String(formData.get('goal') ?? '').trim() || null;
  const difficulty = String(formData.get('difficulty') ?? '') as
    | 'beginner' | 'intermediate' | 'advanced' | '';

  if (!name) throw new Error('Plan name is required');

  const { data, error } = await supabase
    .from('workout_plans')
    .insert({
      user_id: user.id,
      name,
      description,
      days_per_week: daysPerWeek,
      goal,
      difficulty: difficulty || null,
      is_public: false,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  // Auto-create the days
  const days = Array.from({ length: daysPerWeek }, (_, i) => ({
    plan_id: data.id,
    day_number: i + 1,
    name: `Day ${i + 1}`,
    muscle_focus: [] as string[],
    order: i + 1,
  }));

  await supabase.from('workout_days').insert(days);

  revalidatePath('/workouts');
  redirect(`/workouts/${data.id}`);
}

export async function deletePlan(planId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await supabase
    .from('workout_plans')
    .delete()
    .eq('id', planId)
    .eq('user_id', user.id);

  revalidatePath('/workouts');
}

export async function addExerciseToDay(
  dayId: string,
  exerciseName: string,
  exerciseId: string,
  sets: number,
  reps: number | null,
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('workout_exercises')
    .select('order')
    .eq('day_id', dayId)
    .order('order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (existing?.order ?? 0) + 1;

  const { error } = await supabase.from('workout_exercises').insert({
    day_id: dayId,
    exercise_id: exerciseId,
    exercise_name: exerciseName,
    sets,
    reps,
    duration_seconds: null,
    weight_kg: null,
    rest_seconds: 90,
    notes: null,
    order: nextOrder,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/workouts');
}

export async function removeExerciseFromDay(exerciseRowId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await supabase
    .from('workout_exercises')
    .delete()
    .eq('id', exerciseRowId);

  revalidatePath('/workouts');
}

export async function updateDayName(dayId: string, name: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from('workout_days')
    .update({ name })
    .eq('id', dayId);
  revalidatePath('/workouts');
}
