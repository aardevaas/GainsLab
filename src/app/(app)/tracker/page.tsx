import Link from 'next/link';
import { Activity, Scale, Camera, Moon, TrendingUp, Flame, HeartPulse } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { WeightChart } from './WeightChart';
import { formatNumber } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Progress Tracker' };

function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function shortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export default async function TrackerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const thirtyDaysAgo = nDaysAgo(30);

  const [measurementsRes, streakFoodRes, streakWorkoutRes] = await Promise.all([
    supabase
      .from('body_measurements')
      .select('date, weight_kg, body_fat_pct')
      .eq('user_id', user!.id)
      .gte('date', thirtyDaysAgo)
      .order('date'),
    supabase
      .from('food_logs')
      .select('date')
      .eq('user_id', user!.id)
      .gte('date', nDaysAgo(7))
      .order('date', { ascending: false }),
    supabase
      .from('workout_sessions')
      .select('date')
      .eq('user_id', user!.id)
      .eq('completed', true)
      .gte('date', nDaysAgo(7)),
  ]);

  const measurements = measurementsRes.data ?? [];
  const latest = measurements.at(-1);
  const previous = measurements.at(-2);

  const weightDelta = latest?.weight_kg && previous?.weight_kg
    ? latest.weight_kg - previous.weight_kg
    : null;

  // Chart data — one point per day over 30 days
  const chartMap: Record<string, { weight_kg: number | null; body_fat_pct: number | null }> = {};
  for (const m of measurements) {
    chartMap[m.date] = { weight_kg: m.weight_kg, body_fat_pct: m.body_fat_pct };
  }

  const chartData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().split('T')[0];
    return {
      date: key,
      label: i % 7 === 0 ? shortDate(key) : '',
      weight_kg: chartMap[key]?.weight_kg ?? null,
      body_fat_pct: chartMap[key]?.body_fat_pct ?? null,
    };
  });

  // Streak: consecutive days with food logged
  const foodDates = new Set((streakFoodRes.data ?? []).map(r => r.date));
  const workoutDates = new Set((streakWorkoutRes.data ?? []).map(r => r.date));
  let streak = 0;
  for (let i = 0; i < 7; i++) {
    const d = nDaysAgo(i);
    if (foodDates.has(d) || workoutDates.has(d)) streak++;
    else break;
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Progress Tracker
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Body composition · habits · trends
          </p>
        </div>
        <Link
          href="/tracker/body"
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
        >
          Log measurement
        </Link>
      </div>

      <div className="flex-1 px-8 py-6 space-y-5 max-w-3xl">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Current weight"
            value={latest?.weight_kg ? `${formatNumber(latest.weight_kg, 1)} kg` : '—'}
            delta={weightDelta !== null ? `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} kg` : null}
            positive={weightDelta !== null ? weightDelta <= 0 : null}
          />
          <StatCard
            label="Body fat"
            value={latest?.body_fat_pct ? `${formatNumber(latest.body_fat_pct, 1)}%` : '—'}
            delta={null}
            positive={null}
          />
          <StatCard
            label="Activity streak"
            value={`${streak}d`}
            delta={null}
            positive={streak > 0}
          />
        </div>

        {/* Weight chart */}
        <div
          className="rounded-xl border p-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Weight (30 days)</h2>
            <TrendingUp size={14} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <WeightChart data={chartData} showBodyFat={!!latest?.body_fat_pct} />
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 gap-3">
          <NavCard href="/tracker/body" icon={<Scale size={18} />} title="Body measurements" desc="Log weight, BF%, measurements" />
          <NavCard href="/tracker/habits" icon={<Activity size={18} />} title="Habit calendar" desc="90-day activity heatmap" />
          <NavCard href="/tracker/photos" icon={<Camera size={18} />} title="Progress photos" desc="Visual transformation" />
          <NavCard href="/tracker/sleep" icon={<Moon size={18} />} title="Sleep log" desc="Track recovery quality" />
          <NavCard href="/tracker/calories" icon={<Flame size={18} />} title="Calorie dashboard" desc="30-day intake vs TDEE" />
          <NavCard href="/profile/body-age" icon={<HeartPulse size={18} />} title="Body age score" desc="5-test fitness assessment" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string | null;
  positive: boolean | null;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>{value}</p>
      {delta && (
        <p className="text-xs mt-0.5" style={{ color: positive ? 'var(--color-accent)' : '#f87171' }}>{delta}</p>
      )}
    </div>
  );
}

function NavCard({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 rounded-xl border transition-all"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div
        className="size-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)' }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
      </div>
    </Link>
  );
}
