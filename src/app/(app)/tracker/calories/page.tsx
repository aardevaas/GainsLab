import Link from 'next/link';
import { ArrowLeft, Flame } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { calculateTDEE } from '@/lib/calculators';
import type { ActivityLevel } from '@/lib/calculators';
import { CalorieDashboardClient } from './CalorieDashboardClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Calorie Dashboard' };

function calcAge(dob: string): number {
  const d = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

function buildDayRange(days: number): string[] {
  const result: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(d.toISOString().split('T')[0]);
  }
  return result;
}

function shortLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export type DayPoint = {
  iso: string;
  label: string;
  intake: number;      // kcal logged from food_logs
  burn: number;        // kcal burned from workout_sessions
  target: number;      // calorie target (TDEE or profile target)
  net: number;         // intake - target (positive = surplus)
};

export type CalorieDashboardData = {
  days90: DayPoint[];
  tdee: number;
  profile: { weight_kg: number | null; goal: string | null };
};

export default async function CalorieDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const ninetyDaysAgo = buildDayRange(90)[0];

  const [profileRes, foodRes, workoutRes, metricsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('date_of_birth, sex, weight_kg, height_cm, activity_level, goal')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('food_logs')
      .select('date, calories')
      .eq('user_id', user.id)
      .gte('date', ninetyDaysAgo)
      .order('date', { ascending: true }),
    supabase
      .from('workout_sessions')
      .select('date, calories_burned')
      .eq('user_id', user.id)
      .gte('date', ninetyDaysAgo)
      .order('date', { ascending: true }),
    supabase
      .from('daily_metrics')
      .select('date, calorie_target')
      .eq('user_id', user.id)
      .gte('date', ninetyDaysAgo)
      .order('date', { ascending: true }),
  ]);

  const profile = profileRes.data;
  const foodLogs = foodRes.data ?? [];
  const workoutSessions = workoutRes.data ?? [];
  const dailyMetrics = metricsRes.data ?? [];

  // Compute TDEE from profile
  let tdee = 0;
  if (profile?.weight_kg && profile?.height_cm && profile?.date_of_birth && profile?.sex && profile?.activity_level) {
    try {
      tdee = calculateTDEE(
        profile.weight_kg,
        profile.height_cm,
        calcAge(profile.date_of_birth),
        profile.sex as 'male' | 'female',
        profile.activity_level as ActivityLevel,
      ).tdee;
    } catch { /* no-op */ }
  }

  // Aggregate per date
  const intakeByDate = new Map<string, number>();
  for (const row of foodLogs) {
    intakeByDate.set(row.date, (intakeByDate.get(row.date) ?? 0) + (row.calories ?? 0));
  }

  const burnByDate = new Map<string, number>();
  for (const row of workoutSessions) {
    burnByDate.set(row.date, (burnByDate.get(row.date) ?? 0) + (row.calories_burned ?? 0));
  }

  const targetByDate = new Map<string, number>();
  for (const row of dailyMetrics) {
    if (row.calorie_target) targetByDate.set(row.date, row.calorie_target);
  }

  const days90 = buildDayRange(90).map(iso => {
    const intake = Math.round(intakeByDate.get(iso) ?? 0);
    const burn = Math.round(burnByDate.get(iso) ?? 0);
    const target = Math.round(targetByDate.get(iso) ?? tdee);
    return {
      iso,
      label: shortLabel(iso),
      intake,
      burn,
      target,
      net: intake > 0 ? intake - target : 0,
    };
  });

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link
          href="/tracker"
          className="size-8 rounded-lg flex items-center justify-center border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div className="flex items-center gap-3">
          <Flame size={18} style={{ color: 'var(--color-accent)' }} />
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
              Calorie Dashboard
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Intake vs target · burn · 30/60/90d projections
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-4xl">
        <CalorieDashboardClient
          days90={days90}
          tdee={tdee}
          weightKg={profile?.weight_kg ?? null}
          goal={profile?.goal ?? null}
          noProfile={!profile?.weight_kg || !profile?.height_cm || !profile?.date_of_birth}
        />

        <div className="mt-6 flex gap-3">
          <Link
            href="/nutrition/log"
            className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Log Food
          </Link>
          <Link
            href="/profile"
            className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Update Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
