'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function weekBounds(): { start: string; end: string } {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export type MyScores = {
  streak: number;
  workoutsWeekly: number;
  nutritionWeekly: number;
};

export async function syncMyScores(): Promise<MyScores> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { streak: 0, workoutsWeekly: 0, nutritionWeekly: 0 };

  const { start, end } = weekBounds();
  const ago90 = nDaysAgo(90);

  const [foodRes, workoutsRes] = await Promise.all([
    supabase.from('food_logs').select('date').eq('user_id', user.id).gte('date', ago90),
    supabase.from('workout_sessions').select('date').eq('user_id', user.id).gte('date', ago90),
  ]);

  const foodDays = new Set(foodRes.data?.map(r => r.date) ?? []);
  const workoutDays = new Set(workoutsRes.data?.map(r => r.date) ?? []);

  const workoutsWeekly = [...workoutDays].filter(d => d >= start && d <= end).length;
  const nutritionWeekly = [...foodDays].filter(d => d >= start && d <= end).length;

  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (foodDays.has(dateStr) || workoutDays.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  await Promise.all([
    supabase.from('leaderboard_scores').upsert(
      { user_id: user.id, category: 'workouts_weekly', period: 'weekly' as const, score: workoutsWeekly },
      { onConflict: 'user_id,category,period' }
    ),
    supabase.from('leaderboard_scores').upsert(
      { user_id: user.id, category: 'nutrition_weekly', period: 'weekly' as const, score: nutritionWeekly },
      { onConflict: 'user_id,category,period' }
    ),
    supabase.from('leaderboard_scores').upsert(
      { user_id: user.id, category: 'streak', period: 'all_time' as const, score: streak },
      { onConflict: 'user_id,category,period' }
    ),
  ]);

  revalidatePath('/community/leaderboard');
  return { streak, workoutsWeekly, nutritionWeekly };
}
