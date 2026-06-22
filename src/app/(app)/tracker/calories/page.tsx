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

function formatDateLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default async function CalorieDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const thirtyDaysAgo = buildDayRange(30)[0];

  const [profileRes, foodLogsRes] = await Promise.all([
    supabase.from('profiles').select('date_of_birth, sex, weight_kg, height_cm, activity_level').eq('user_id', user.id).single(),
    supabase
      .from('food_logs')
      .select('date, calories')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: true }),
  ]);

  const profile = profileRes.data;
  const logs = foodLogsRes.data ?? [];

  // Compute TDEE
  let tdee = 0;
  if (
    profile?.weight_kg &&
    profile?.height_cm &&
    profile?.date_of_birth &&
    profile?.sex &&
    profile?.activity_level
  ) {
    try {
      const age = calcAge(profile.date_of_birth);
      const result = calculateTDEE(
        profile.weight_kg,
        profile.height_cm,
        age,
        profile.sex as 'male' | 'female',
        profile.activity_level as ActivityLevel,
      );
      tdee = result.tdee;
    } catch {
      tdee = 0;
    }
  }

  // Aggregate food logs by date
  const byDate = new Map<string, number>();
  for (const log of logs) {
    byDate.set(log.date, (byDate.get(log.date) ?? 0) + (log.calories ?? 0));
  }

  // Build 30-day chart array
  const days = buildDayRange(30);
  const chartData = days.map(d => ({
    date: formatDateLabel(d),
    intake: Math.round(byDate.get(d) ?? 0),
    tdee,
  }));

  // Stats
  const loggedDays = chartData.filter(d => d.intake > 0);
  const avgIntake = loggedDays.length > 0
    ? Math.round(loggedDays.reduce((s, d) => s + d.intake, 0) / loggedDays.length)
    : 0;
  const avgDelta = tdee > 0 && avgIntake > 0 ? avgIntake - tdee : 0;

  // 30-day weight projection: 7700 kcal ≈ 1 kg fat
  const projectedWeightKg = avgDelta !== 0
    ? parseFloat((avgDelta * 30 / 7700).toFixed(2))
    : 0;

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link href="/tracker" className="size-8 rounded-lg flex items-center justify-center border" style={{ borderColor: 'var(--color-border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div className="flex items-center gap-3">
          <Flame size={18} style={{ color: 'var(--color-accent)' }} />
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
              Calorie Dashboard
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              30-day intake vs TDEE · weight projection
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-3xl">
        <CalorieDashboardClient
          data={chartData}
          tdee={tdee}
          avgIntake={avgIntake}
          avgDelta={avgDelta}
          projectedWeightKg={projectedWeightKg}
        />

        {/* Log food CTA */}
        <div className="mt-6 flex gap-3">
          <Link
            href="/nutrition/log"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Log Food
          </Link>
          <Link
            href="/profile"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Update Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
