'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

type ExerciseSave = {
  exercise_name: string;
  sets: number | null;
  reps: string | null;
  weight_guidance: string | null;
  rest_seconds: number | null;
  notes: string | null;
  order_index: number;
};

type NutritionSave = {
  calorie_target: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  meal_timing_notes: string | null;
};

async function getCreatorAndVerifyDay(dayId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: creator } = await supabase
    .from('creator_profiles').select('id').eq('user_id', user.id).maybeSingle();
  if (!creator) return null;

  const { data: day } = await supabase
    .from('program_days').select('id, week_id').eq('id', dayId).single();
  if (!day) return null;

  const { data: week } = await supabase
    .from('program_weeks').select('program_id').eq('id', day.week_id).single();
  if (!week) return null;

  const { data: program } = await supabase
    .from('programs').select('id').eq('id', week.program_id).eq('creator_id', creator.id).single();
  if (!program) return null;

  return { supabase, creator, programId: program.id };
}

export async function loadDayContent(dayId: string) {
  const ctx = await getCreatorAndVerifyDay(dayId);
  if (!ctx) return { exercises: [], nutrition: null };
  const { supabase } = ctx;

  const [exRes, nutrRes] = await Promise.all([
    supabase.from('program_exercises')
      .select('id, exercise_name, sets, reps, weight_guidance, rest_seconds, notes, order_index')
      .eq('day_id', dayId).order('order_index'),
    supabase.from('program_nutrition')
      .select('id, calorie_target, protein_g, carbs_g, fat_g, meal_timing_notes')
      .eq('day_id', dayId).maybeSingle(),
  ]);

  return { exercises: exRes.data ?? [], nutrition: nutrRes.data ?? null };
}

export async function saveDayExercises(dayId: string, exercises: ExerciseSave[]) {
  const ctx = await getCreatorAndVerifyDay(dayId);
  if (!ctx) return { error: 'Unauthorized' };
  const { supabase } = ctx;

  await supabase.from('program_exercises').delete().eq('day_id', dayId);

  if (exercises.length > 0) {
    const rows = exercises.map((e, i) => ({
      day_id: dayId,
      exercise_name: e.exercise_name,
      sets: e.sets,
      reps: e.reps,
      weight_guidance: e.weight_guidance,
      rest_seconds: e.rest_seconds,
      notes: e.notes,
      order_index: i,
      exercise_id: null,
    }));
    const { error } = await supabase.from('program_exercises').insert(rows);
    if (error) return { error: error.message };
  }

  return { ok: true };
}

export async function saveDayNutrition(dayId: string, nutr: NutritionSave) {
  const ctx = await getCreatorAndVerifyDay(dayId);
  if (!ctx) return { error: 'Unauthorized' };
  const { supabase } = ctx;

  const { error } = await supabase.from('program_nutrition').upsert(
    { day_id: dayId, ...nutr, recommended_recipe_ids: [] },
    { onConflict: 'day_id', ignoreDuplicates: false },
  );
  if (error) return { error: error.message };

  return { ok: true };
}

export async function toggleDayRest(dayId: string, rest_day: boolean) {
  const ctx = await getCreatorAndVerifyDay(dayId);
  if (!ctx) return;
  const { supabase } = ctx;
  await supabase.from('program_days').update({ rest_day }).eq('id', dayId);
}

export async function updateDayTitle(dayId: string, title: string) {
  const ctx = await getCreatorAndVerifyDay(dayId);
  if (!ctx) return;
  const { supabase } = ctx;
  await supabase.from('program_days').update({ title: title.trim() || null }).eq('id', dayId);
}

export async function toggleProgramPublish(programId: string, currentValue: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: creator } = await supabase
    .from('creator_profiles').select('id').eq('user_id', user.id).maybeSingle();
  if (!creator) return;

  await supabase.from('programs')
    .update({ is_published: !currentValue })
    .eq('id', programId).eq('creator_id', creator.id);

  revalidatePath(`/studio/programs/${programId}`);
  revalidatePath('/studio/programs');
}
