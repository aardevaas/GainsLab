// The Gains Score engine — computes the daily_metrics spine that every consumer
// (dashboard, streaks, leaderboards, creator analytics, AI) reads from.
// Implements the v1 of docs/product/sections/gains-score.md:
//   process-driven pillars, goal-weighted, graceful degradation, 7-day EWMA.
// v2 will add the §3.6 fairness-normalized outcome trend + Recovery pillar.

import { createClient } from '@/lib/supabase/server';
import {
  calculateMacros,
  type ActivityLevel,
  type Gender,
  type MacroPreset,
} from '@/lib/calculators';

type Pillar = 'nutrition' | 'training' | 'recovery' | 'consistency' | 'progress';

// v1 default + goal-adjusted weights (gains-score §3.3). Recovery present but
// dropped via graceful degradation until sleep data exists.
const GOAL_WEIGHTS: Record<string, Record<Pillar, number>> = {
  general_fitness:   { nutrition: 30, training: 30, recovery: 15, consistency: 15, progress: 10 },
  maintain:          { nutrition: 30, training: 30, recovery: 15, consistency: 15, progress: 10 },
  lose_weight:       { nutrition: 35, training: 25, recovery: 10, consistency: 20, progress: 10 },
  gain_muscle:       { nutrition: 35, training: 30, recovery: 15, consistency: 10, progress: 10 },
  improve_endurance: { nutrition: 20, training: 35, recovery: 20, consistency: 15, progress: 10 },
};

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

/** Weighted sum over only the pillars that have data (drop + renormalize). */
function weightedScore(subs: Partial<Record<Pillar, number>>, goal: string): number {
  const w = GOAL_WEIGHTS[goal] ?? GOAL_WEIGHTS.general_fitness;
  let totalW = 0;
  let acc = 0;
  for (const p of Object.keys(w) as Pillar[]) {
    const s = subs[p];
    if (s == null) continue;
    totalW += w[p];
    acc += w[p] * s;
  }
  return totalW === 0 ? 0 : round1(acc / totalW);
}

/** Calorie adherence: 100 within ±5%, linear to 0 at ±30%; goal-aware on direction. */
function calorieAdherence(intake: number, target: number, goal: string): number {
  if (target <= 0) return 0;
  const dev = (intake - target) / target; // + = over, − = under
  let effective = Math.abs(dev);
  if (goal === 'lose_weight' && dev < 0) effective = Math.abs(dev) * 0.4; // under is fine when cutting
  if (goal === 'gain_muscle' && dev > 0) effective = dev * 0.5; // over is less bad when bulking
  return clamp(100 * (1 - Math.max(0, effective - 0.05) / 0.25));
}

function localDate(timezone: string): string {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: timezone }); // YYYY-MM-DD
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}
function calcAge(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / 3.156e10);
}
function weekStart(dateISO: string): string {
  const d = new Date(dateISO + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/** Compute & persist the day's targets snapshot; returns it (nulls if profile incomplete). */
async function ensureDailyTargets(supabase: SupabaseServer, userId: string, date: string) {
  const { data: existing } = await supabase
    .from('daily_targets').select('*').eq('user_id', userId).eq('date', date).maybeSingle();
  if (existing) return existing;

  const [{ data: profile }, { data: diet }, { data: plan }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).single(),
    supabase.from('dietary_profiles').select('macro_preset').eq('user_id', userId).maybeSingle(),
    supabase.from('workout_plans').select('days_per_week').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  let calorie: number | null = null, protein: number | null = null,
      carb: number | null = null, fat: number | null = null;
  if (profile?.weight_kg && profile?.height_cm && profile?.date_of_birth && profile?.sex && profile?.activity_level) {
    const m = calculateMacros(
      profile.weight_kg, profile.height_cm, calcAge(profile.date_of_birth),
      profile.sex as Gender, profile.activity_level as ActivityLevel,
      (diet?.macro_preset ?? 'balanced') as MacroPreset,
    ).maintenance;
    calorie = m.calories; protein = m.proteinG; carb = m.carbsG; fat = m.fatG;
  }

  const row = {
    user_id: userId, date,
    calorie_target: calorie, protein_target: protein, carb_target: carb, fat_target: fat,
    training_freq_target: plan?.days_per_week ?? 3,
    goal: profile?.goal ?? 'general_fitness',
  };
  await supabase.from('daily_targets').upsert(row, { onConflict: 'user_id,date' });
  return row;
}

/**
 * Recompute today's (or a given day's) Gains Score for a user and persist the
 * daily_metrics row. Safe to call from any write path; best-effort.
 */
export async function recomputeDailyMetrics(userId: string, dateISO?: string): Promise<void> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles').select('timezone, goal').eq('user_id', userId).single();
  const goal = profile?.goal ?? 'general_fitness';
  const date = dateISO ?? localDate(profile?.timezone ?? 'UTC');
  const ws = weekStart(date);
  const ago30 = new Date(new Date(date).getTime() - 30 * 864e5).toISOString().split('T')[0];

  const targets = await ensureDailyTargets(supabase, userId, date);

  const [foodToday, sessions, activity, measurements, prev] = await Promise.all([
    supabase.from('food_logs').select('calories, protein_g, carbs_g, fat_g').eq('user_id', userId).eq('date', date),
    supabase.from('workout_sessions').select('date').eq('user_id', userId).eq('completed', true).gte('date', ago30).lte('date', date),
    supabase.from('food_logs').select('date').eq('user_id', userId).gte('date', ago30),
    supabase.from('body_measurements').select('date').eq('user_id', userId).gte('date', ago30).order('date', { ascending: false }),
    supabase.from('daily_metrics').select('gains_score').eq('user_id', userId).lt('date', date).order('date', { ascending: false }).limit(1).maybeSingle(),
  ]);

  const food = foodToday.data ?? [];
  const loggedFood = food.length > 0;
  const caloriesIn = food.reduce((s, f) => s + (f.calories ?? 0), 0);
  const proteinIn = food.reduce((s, f) => s + (f.protein_g ?? 0), 0);
  const carbsIn = food.reduce((s, f) => s + (f.carbs_g ?? 0), 0);
  const fatIn = food.reduce((s, f) => s + (f.fat_g ?? 0), 0);

  const workoutDays = new Set((sessions.data ?? []).map((r) => r.date));
  const sessionsThisWeek = [...workoutDays].filter((d) => d >= ws && d <= date).length;
  const loggedWorkout = workoutDays.has(date);

  // ── Pillars ──
  const subs: Partial<Record<Pillar, number>> = {};

  // Nutrition — only when there's a credible log AND a calorie target
  if (loggedFood && targets.calorie_target && targets.protein_target) {
    const calAdh = calorieAdherence(caloriesIn, targets.calorie_target, goal);
    const protAdh = clamp((proteinIn / targets.protein_target) * 100);
    subs.nutrition = round1(0.5 * calAdh + 0.35 * protAdh + 0.15 * 100);
  }

  // Training — weekly pace vs target frequency
  const freqTarget = targets.training_freq_target ?? 3;
  if (freqTarget > 0) {
    subs.training = round1(clamp((sessionsThisWeek / freqTarget) * 100));
  }

  // Consistency — streak strength (consecutive days with food or workout activity)
  const foodDays = new Set((activity.data ?? []).map((r) => r.date));
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(new Date(date).getTime() - i * 864e5).toISOString().split('T')[0];
    if (foodDays.has(d) || workoutDays.has(d)) streak++;
    else break;
  }
  subs.consistency = round1(clamp(streak * 12.5)); // 8-day streak → 100

  // Progress — v1 cadence (logged body data recently?); §3.6 fair trend = v2
  const meas = measurements.data ?? [];
  if (meas.length > 0) {
    const last = meas[0].date;
    const daysSince = Math.floor((new Date(date).getTime() - new Date(last).getTime()) / 864e5);
    subs.progress = daysSince <= 7 ? 100 : daysSince <= 14 ? 60 : 30;
  }

  const dailyScore = weightedScore(subs, goal);

  // 7-day EWMA (half-life ≈ 3 days → alpha ≈ 0.206)
  const alpha = 0.206;
  const prevGains = prev.data?.gains_score ?? null;
  const gainsScore = prevGains == null ? dailyScore : round1(alpha * dailyScore + (1 - alpha) * prevGains);

  await supabase.from('daily_metrics').upsert(
    {
      user_id: userId, date,
      calories_in: caloriesIn, protein_g: proteinIn, carbs_g: carbsIn, fat_g: fatIn,
      calorie_target: targets.calorie_target, protein_target: targets.protein_target,
      trained: sessionsThisWeek > 0, session_count_week: sessionsThisWeek,
      logged_food: loggedFood, logged_workout: loggedWorkout, logged_progress: false,
      pillar_nutrition: subs.nutrition ?? null,
      pillar_training: subs.training ?? null,
      pillar_recovery: null,
      pillar_consistency: subs.consistency ?? null,
      pillar_progress: subs.progress ?? null,
      daily_score: dailyScore, gains_score: gainsScore,
      goal_snapshot: goal,
      computed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,date' },
  );
}
