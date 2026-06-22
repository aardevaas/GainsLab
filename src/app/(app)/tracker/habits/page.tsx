import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { HabitHeatmap, type DayScore } from '../HabitHeatmap';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Habit Calendar' };

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ninetyOneAgo = addDays(today, -90);

  const ninetyOneAgoStr = dateStr(ninetyOneAgo);

  const [foodRes, workoutRes] = await Promise.all([
    supabase.from('food_logs').select('date').eq('user_id', user!.id).gte('date', ninetyOneAgoStr),
    supabase.from('workout_sessions').select('date').eq('user_id', user!.id).eq('completed', true).gte('date', ninetyOneAgoStr),
  ]);

  const foodDates = new Set((foodRes.data ?? []).map(r => r.date));
  const workoutDates = new Set((workoutRes.data ?? []).map(r => r.date));

  // Build 91-day array starting from aligned Monday
  // Find Monday on or before 91 days ago
  const startDate = new Date(ninetyOneAgo);
  const dow = startDate.getDay(); // 0=Sun
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
    const score = (food && workout ? 2 : food || workout ? 1 : 0) as 0 | 1 | 2 | 3;

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

  // Group into weeks (columns of 7 days starting Monday)
  const weeks: DayScore[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Streak: consecutive days from today with any activity
  let streak = 0;
  for (let i = 0; i <= 90; i++) {
    const d = dateStr(addDays(today, -i));
    if (foodDates.has(d) || workoutDates.has(d)) streak++;
    else break;
  }

  const totalActive = [...Array(91)].filter((_, i) => {
    const d = dateStr(addDays(today, -i));
    return foodDates.has(d) || workoutDates.has(d);
  }).length;

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link href="/tracker" className="size-8 rounded-lg flex items-center justify-center border" style={{ borderColor: 'var(--color-border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Habit Calendar</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>90-day activity heatmap</p>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 max-w-2xl space-y-6">
        <div
          className="rounded-xl border p-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <HabitHeatmap weeks={weeks} streak={streak} totalActive={totalActive} />
        </div>

        {/* Per-habit breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-xl border p-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Nutrition logged (90d)</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
              {foodDates.size}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {Math.round((foodDates.size / 90) * 100)}% consistency
            </p>
          </div>
          <div
            className="rounded-xl border p-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Workouts done (90d)</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
              {workoutDates.size}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {Math.round((workoutDates.size / 90) * 100)}% consistency
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
