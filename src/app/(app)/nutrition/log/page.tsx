import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { calculateMacros, type ActivityLevel, type Gender, type MacroPreset } from '@/lib/calculators';
import type { FoodLogEntry } from '@/lib/nutrition/types';
import { FoodLogClient } from './FoodLogClient';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Food Log' };

function calcAge(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / 3.156e10);
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export default async function FoodLogPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? todayStr();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profileRes, dietRes, logRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
    supabase.from('dietary_profiles').select('macro_preset').eq('user_id', user!.id).single(),
    supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user!.id)
      .eq('date', date)
      .order('created_at'),
  ]);

  const profile = profileRes.data;
  const macroPreset = (dietRes.data?.macro_preset ?? 'balanced') as MacroPreset;
  const entries = (logRes.data ?? []) as FoodLogEntry[];

  let goals = { calories: 2000, proteinG: 150, carbsG: 200, fatG: 67 };
  if (
    profile?.weight_kg &&
    profile?.height_cm &&
    profile?.date_of_birth &&
    profile?.sex &&
    profile?.activity_level
  ) {
    const age = calcAge(profile.date_of_birth);
    const macros = calculateMacros(
      profile.weight_kg,
      profile.height_cm,
      age,
      profile.sex as Gender,
      profile.activity_level as ActivityLevel,
      macroPreset,
    );
    const m = macros.maintenance;
    goals = { calories: m.calories, proteinG: m.proteinG, carbsG: m.carbsG, fatG: m.fatG };
  }

  const isToday = date === todayStr();
  const prevDate = new Date(date + 'T12:00:00');
  prevDate.setDate(prevDate.getDate() - 1);
  const nextDate = new Date(date + 'T12:00:00');
  nextDate.setDate(nextDate.getDate() + 1);

  return (
    <div className="flex flex-col min-h-full">
      <div
        className="px-8 py-5 border-b flex items-center gap-4"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <Link
          href="/nutrition"
          className="size-8 rounded-lg flex items-center justify-center border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div className="flex-1">
          <h1
            className="text-xl font-bold"
            style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}
          >
            Food Log
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {isToday ? 'Today · ' : ''}{formatDate(date + 'T00:00:00')}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href={`/nutrition/log?date=${prevDate.toISOString().split('T')[0]}`}
            className="size-8 flex items-center justify-center rounded-lg border text-sm"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            ‹
          </Link>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <Calendar size={12} />
            {date}
          </div>
          <Link
            href={`/nutrition/log?date=${nextDate.toISOString().split('T')[0]}`}
            style={{
              pointerEvents: isToday ? 'none' : 'auto',
              opacity: isToday ? 0.4 : 1,
            }}
            className="size-8 flex items-center justify-center rounded-lg border text-sm"
          >
            ›
          </Link>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 max-w-2xl">
        <FoodLogClient date={date} entries={entries} goals={goals} />
      </div>
    </div>
  );
}
