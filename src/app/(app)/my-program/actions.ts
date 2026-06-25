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

export async function markDayComplete(dayId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { error } = await supabase
    .from('program_day_completions')
    .insert({ user_id: user.id, day_id: dayId });
  if (error && error.code !== '23505') return { error: error.message };
  return {};
}

export async function unmarkDayComplete(dayId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { error } = await supabase
    .from('program_day_completions')
    .delete()
    .eq('user_id', user.id)
    .eq('day_id', dayId);
  if (error) return { error: error.message };
  return {};
}

export async function submitRating(
  rosterId: string,
  creatorId: string,
  rating: number,
  reviewText: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase.from('creator_ratings').upsert({
    roster_id: rosterId,
    creator_id: creatorId,
    member_user_id: user.id,
    rating,
    review_text: reviewText.trim() || null,
  }, { onConflict: 'roster_id' });

  if (error) return { error: error.message };
  return {};
}
