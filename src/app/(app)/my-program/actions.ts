'use server';

import { createClient } from '@/lib/supabase/server';

export async function loadMemberDayContent(dayId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { exercises: [], nutrition: null };

  const [exRes, nutrRes] = await Promise.all([
    supabase
      .from('program_exercises')
      .select('exercise_name, sets, reps, weight_guidance, rest_seconds, notes, order_index')
      .eq('day_id', dayId)
      .order('order_index'),
    supabase
      .from('program_nutrition')
      .select('calorie_target, protein_g, carbs_g, fat_g, meal_timing_notes')
      .eq('day_id', dayId)
      .maybeSingle(),
  ]);

  return {
    exercises: exRes.data ?? [],
    nutrition: nutrRes.data ?? null,
  };
}
