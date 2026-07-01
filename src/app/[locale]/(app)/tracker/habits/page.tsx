import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { HabitHeatmap, type DayScore } from '../HabitHeatmap';
import { HabitXPBar } from './HabitXPBar';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Habit Calendar' };

const XP_PER_SCORE: Record<number, number> = { 0: 0, 1: 50, 2: 125, 3: 200 };
const MILESTONE_THRESHOLDS = [7, 14, 30, 60, 90] as const;
const MILESTONE_BONUS: Record<number, number> = { 7: 100, 14: 200, 30: 500, 60: 1000, 90: 2000 };

export type Milestone = { days: number; label: string; earned: boolean };

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export default async function HabitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ninetyOneAgo = addDays(today, -90);
  const ninetyOneAgoStr = dateStr(ninetyOneAgo);

  const [foodRes, workoutRes, metricsRes] = await Promise.all([
    supabase.from('food_logs').select('date').eq('user_id', user.id).gte('date', ninetyOneAgoStr),
    supabase.from('workout_sessions').select('date').eq('user_id', user.id).eq('completed', true).gte('date', ninetyOneAgoStr),
    supabase.from('daily_metrics').select('date,calories_in,calorie_target').eq('user_id', user.id).gte('date', ninetyOneAgoStr),
  ]);

  const foodDates = new Set((foodRes.data ?? []).map(r => r.date));
  const workoutDates = new Set((workoutRes.data ?? []).map(r => r.date));

  // Map date → calorie goal hit (within ±10% of target)
  const goalHitDates = new Set<string>();
  for (const m of metricsRes.data ?? []) {
    if (m.calories_in && m.calorie_target && m.calorie_target > 0) {
      const ratio = m.calories_in / m.calorie_target;
      if (ratio >= 0.9 && ratio <= 1.1) goalHitDates.add(m.date);
    }
  }

  // Build 91-day array aligned to Monday
  const startDate = new Date(ninetyOneAgo);
  const dow = startDate.getDay();
  const toMonday = dow === 0 ? -6 : 1 - dow;
  startDate.setDate(startDate.getDate() + toMonday);

  const days: DayScore[] = [];
  const cursor = new Date(startDate);
  let prevMonth = -1;

  while (cursor <= addDays(today, 6)) {
    const ds = dateStr(cursor);
    const isFuture = cursor > today;
    const food = foodDates.has(ds);
    const workout = workoutDates.has(ds);
    const goalHit = goalHitDates.has(ds);
    const score = (
      food && workout && goalHit ? 3
        : food && workout ? 2
          : food || workout ? 1
            : 0
    ) as 0 | 1 | 2 | 3;

    const month = cursor.getMonth();
    const monthLabel = month !== prevMonth && cursor.getDate() <= 7
      ? cursor.toLocaleDateString('en', { month: 'short' })
      : null;
    prevMonth = month;

    days.push({
      date: ds,
      label: cursor.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
      monthLabel,
      score,
      foodLogged: food,
      workoutLogged: workout,
      isFuture,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks: DayScore[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Current streak (consecutive days from today)
  let streak = 0;
  for (let i = 0; i <= 90; i++) {
    const d = dateStr(addDays(today, -i));
    if (foodDates.has(d) || workoutDates.has(d)) streak++;
    else break;
  }

  // Max streak in the 90-day window (for milestone badges)
  let maxStreak = 0;
  let runStreak = 0;
  for (let i = 90; i >= 0; i--) {
    const d = dateStr(addDays(today, -i));
    if (foodDates.has(d) || workoutDates.has(d)) {
      runStreak++;
      maxStreak = Math.max(maxStreak, runStreak);
    } else {
      runStreak = 0;
    }
  }

  const totalActive = [...Array(91)].filter((_, i) => {
    const d = dateStr(addDays(today, -i));
    return foodDates.has(d) || workoutDates.has(d);
  }).length;

  // XP: sum per-day + milestone bonuses
  const dayXP = days
    .filter(d => !d.isFuture)
    .reduce((sum, d) => sum + XP_PER_SCORE[d.score], 0);

  const milestoneXP = MILESTONE_THRESHOLDS.reduce((sum, t) => {
    return sum + (maxStreak >= t ? MILESTONE_BONUS[t] : 0);
  }, 0);

  const totalXP = dayXP + milestoneXP;

  const milestones: Milestone[] = MILESTONE_THRESHOLDS.map(t => ({
    days: t,
    label: `${t}d`,
    earned: maxStreak >= t,
  }));

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link href="/tracker" className="size-8 rounded-lg flex items-center justify-center border" style={{ borderColor: 'var(--color-border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Habit Calendar</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>90-day activity heatmap · XP · streaks</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-2xl space-y-5">
        {/* XP bar + level + milestone badges */}
        <HabitXPBar
          totalXP={totalXP}
          streak={streak}
          milestones={milestones}
        />

        {/* Heatmap */}
        <div
          className="rounded-xl border p-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <HabitHeatmap weeks={weeks} streak={streak} totalActive={totalActive} />
        </div>

        {/* Per-habit breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Nutrition (90d)</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.03em' }}>{foodDates.size}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {Math.round((foodDates.size / 90) * 100)}% consistent
            </p>
          </div>
          <div className="rounded-xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Workouts (90d)</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.03em' }}>{workoutDates.size}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {Math.round((workoutDates.size / 90) * 100)}% consistent
            </p>
          </div>
          <div className="rounded-xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Goal days (90d)</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.03em' }}>{goalHitDates.size}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              food + workout + calories
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
