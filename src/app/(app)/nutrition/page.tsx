import Link from 'next/link';
import { UtensilsCrossed, ArrowRight, Plus, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { calculateMacros, type ActivityLevel, type Gender, type MacroPreset } from '@/lib/calculators';
import { sumMacros, type FoodLogEntry } from '@/lib/nutrition/types';
import { formatNumber } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Nutrition' };

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}
function calcAge(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / 3.156e10);
}

export default async function NutritionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = todayStr();

  const [profileRes, dietRes, logRes, weekRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
    supabase.from('dietary_profiles').select('macro_preset').eq('user_id', user!.id).single(),
    supabase.from('food_logs').select('*').eq('user_id', user!.id).eq('date', today),
    supabase
      .from('food_logs')
      .select('date, calories')
      .eq('user_id', user!.id)
      .gte('date', (() => {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        return d.toISOString().split('T')[0];
      })())
      .order('date'),
  ]);

  const profile = profileRes.data;
  const macroPreset = (dietRes.data?.macro_preset ?? 'balanced') as MacroPreset;
  const todayEntries = (logRes.data ?? []) as FoodLogEntry[];
  const todayTotals = sumMacros(todayEntries);

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

  // Aggregate week calories by day
  const weekByDay: Record<string, number> = {};
  for (const r of weekRes.data ?? []) {
    weekByDay[r.date] = (weekByDay[r.date] ?? 0) + r.calories;
  }
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    return { key, label: d.toLocaleDateString('en', { weekday: 'short' }), cals: weekByDay[key] ?? 0 };
  });
  const weekMax = Math.max(...weekDays.map(d => d.cals), goals.calories);

  const calPct = Math.min(100, Math.round((todayTotals.calories / goals.calories) * 100));

  return (
    <div className="flex flex-col min-h-full">
      <div
        className="px-8 py-6 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Nutrition
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          href="/nutrition/log"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
        >
          <Plus size={14} /> Log food
        </Link>
      </div>

      <div className="flex-1 px-8 py-6 space-y-6 max-w-3xl">
        {/* Calorie ring card */}
        <div
          className="rounded-xl border p-6 flex items-center gap-8"
          style={{ background: 'var(--color-surface)', borderColor: 'rgba(74,222,128,0.2)' }}
        >
          {/* Circle */}
          <div className="relative shrink-0" style={{ width: 96, height: 96 }}>
            <svg viewBox="0 0 96 96" className="w-24 h-24 -rotate-90">
              <circle cx="48" cy="48" r="40" fill="none" stroke="var(--color-border)" strokeWidth="8" />
              <circle
                cx="48" cy="48" r="40" fill="none"
                stroke="var(--color-accent)" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - calPct / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>
                {calPct}%
              </span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Today's calories
            </p>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-accent)', letterSpacing: '-0.03em' }}>
              {formatNumber(todayTotals.calories)}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              / {formatNumber(goals.calories)} kcal goal
            </p>
            <div className="flex gap-4 mt-3 text-xs">
              <Macro label="Protein" value={todayTotals.proteinG} goal={goals.proteinG} color="#4ade80" />
              <Macro label="Carbs" value={todayTotals.carbsG} goal={goals.carbsG} color="#60a5fa" />
              <Macro label="Fat" value={todayTotals.fatG} goal={goals.fatG} color="#fbbf24" />
            </div>
          </div>
          <Link
            href="/nutrition/log"
            className="shrink-0 flex items-center gap-1 text-xs font-semibold"
            style={{ color: 'var(--color-accent)' }}
          >
            View log <ArrowRight size={12} />
          </Link>
        </div>

        {/* Weekly bar chart */}
        <div
          className="rounded-xl border p-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              This week
            </h2>
            <TrendingUp size={14} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <div className="flex items-end gap-2 h-20">
            {weekDays.map(d => {
              const h = d.cals ? Math.max(4, Math.round((d.cals / weekMax) * 80)) : 4;
              const isToday2 = d.key === today;
              return (
                <Link
                  key={d.key}
                  href={`/nutrition/log?date=${d.key}`}
                  className="flex-1 flex flex-col items-center gap-1 group"
                >
                  <div
                    className="w-full rounded-sm transition-all"
                    style={{
                      height: h,
                      background: isToday2
                        ? 'var(--color-accent)'
                        : d.cals
                          ? 'var(--color-text-muted)'
                          : 'var(--color-border)',
                      opacity: isToday2 ? 1 : 0.7,
                    }}
                  />
                  <span
                    className="text-[10px]"
                    style={{ color: isToday2 ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                  >
                    {d.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 gap-4">
          <QuickCard
            href="/nutrition/log"
            icon={<UtensilsCrossed size={18} />}
            title="Today's log"
            desc={`${todayEntries.length} items logged`}
          />
          <QuickCard
            href="/recipes"
            icon={<span className="text-lg">🍳</span>}
            title="Recipes"
            desc="Browse meal ideas"
          />
          <QuickCard
            href="/grocery"
            icon={<span className="text-lg">🛒</span>}
            title="Grocery list"
            desc="Weekly shopping"
          />
          <QuickCard
            href="/profile/macros"
            icon={<span className="text-lg">⚗️</span>}
            title="Macro targets"
            desc="Full analysis"
          />
        </div>
      </div>
    </div>
  );
}

function Macro({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div>
      <p style={{ color }}>{formatNumber(value, 1)}g</p>
      <p style={{ color: 'var(--color-text-muted)' }}>{label} {pct}%</p>
    </div>
  );
}

function QuickCard({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
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
