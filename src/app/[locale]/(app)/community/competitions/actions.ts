'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

async function computeScore(
  userId: string,
  type: string,
  startDate: string,
  endDate: string,
  currentStreak: number
): Promise<number> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  const effectiveEnd = endDate < today ? endDate : today;

  if (type === 'workouts') {
    const { count } = await supabase
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', effectiveEnd);
    return count ?? 0;
  }

  if (type === 'streak') {
    return currentStreak;
  }

  if (type === 'custom') {
    const foodRes = await supabase
      .from('food_logs')
      .select('date')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', effectiveEnd);
    return new Set(foodRes.data?.map(r => r.date) ?? []).size;
  }

  return 0;
}

export async function joinCompetition(competitionId: string, currentStreak = 0): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: comp } = await supabase
    .from('competitions')
    .select('type, start_date, end_date')
    .eq('id', competitionId)
    .single();

  if (!comp) return;

  const score = await computeScore(user.id, comp.type, comp.start_date, comp.end_date, currentStreak);

  await supabase.from('competition_entries').upsert(
    {
      competition_id: competitionId,
      user_id: user.id,
      score,
      joined_at: new Date().toISOString(),
    },
    { onConflict: 'competition_id,user_id' }
  );

  revalidatePath(`/community/competitions/${competitionId}`);
  revalidatePath('/community/competitions');
}

export async function leaveCompetition(competitionId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('competition_entries')
    .delete()
    .eq('competition_id', competitionId)
    .eq('user_id', user.id);

  revalidatePath(`/community/competitions/${competitionId}`);
  revalidatePath('/community/competitions');
}

export async function refreshCompetitionScore(
  competitionId: string,
  currentStreak = 0
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: comp } = await supabase
    .from('competitions')
    .select('type, start_date, end_date')
    .eq('id', competitionId)
    .single();
  if (!comp) return;

  const score = await computeScore(user.id, comp.type, comp.start_date, comp.end_date, currentStreak);

  await supabase
    .from('competition_entries')
    .update({ score })
    .eq('competition_id', competitionId)
    .eq('user_id', user.id);

  revalidatePath(`/community/competitions/${competitionId}`);
}

export async function updateWorkoutCompetitions(userId: string): Promise<void> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: entries } = await supabase
    .from('competition_entries')
    .select('competition_id')
    .eq('user_id', userId);

  if (!entries?.length) return;

  const competitionIds = entries.map(e => e.competition_id);

  const { data: comps } = await supabase
    .from('competitions')
    .select('id, type, start_date, end_date')
    .in('id', competitionIds)
    .eq('is_active', true)
    .eq('type', 'workouts')
    .gte('end_date', today);

  if (!comps?.length) return;

  for (const comp of comps) {
    const score = await computeScore(userId, comp.type, comp.start_date, comp.end_date, 0);
    await supabase
      .from('competition_entries')
      .update({ score })
      .eq('competition_id', comp.id)
      .eq('user_id', userId);
  }
}

void nDaysAgo; // kept for future calorie/steps scoring
