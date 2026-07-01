import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { syncMyScores } from '../actions';
import { ShareCardClient } from './ShareCardClient';
import { requirePro } from '@/lib/payments/gate';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Share Progress' };

export default async function SharePage() {
  await requirePro();
  const supabase = await createClient();

  const [{ data: { user } }, scores] = await Promise.all([
    supabase.auth.getUser(),
    syncMyScores(),
  ]);

  const profileRes = user
    ? await supabase.from('profiles').select('name, username').eq('user_id', user.id).single()
    : null;

  const displayName = profileRes?.data?.name ?? profileRes?.data?.username ?? 'Athlete';

  // Fetch avg daily calories this week
  const { start } = weekBounds();
  const foodLogsRes = await supabase
    .from('food_logs')
    .select('calories')
    .eq('user_id', user!.id)
    .gte('date', start);

  const entries = foodLogsRes.data ?? [];
  const avgCalories = entries.length > 0
    ? Math.round(entries.reduce((s, r) => s + (r.calories ?? 0), 0) / entries.length)
    : 0;

  const imageUrl = buildCardUrl({ name: displayName, streak: scores.streak, workouts: scores.workoutsWeekly, calories: avgCalories, gainsScore: scores.gainsScore });
  const shareText = scores.gainsScore > 0
    ? `⭐ ${scores.gainsScore} Gains Score | 🔥 ${scores.streak}-day streak | 💪 ${scores.workoutsWeekly} workouts this week | Tracking with GainsLab`
    : `🔥 ${scores.streak}-day streak | 💪 ${scores.workoutsWeekly} workouts this week | Tracking with GainsLab`;

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link href="/community" className="size-8 rounded-lg flex items-center justify-center border" style={{ borderColor: 'var(--color-border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Share Progress</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Your weekly summary card</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-2xl">
        <ShareCardClient imageUrl={imageUrl} shareText={shareText} />
      </div>
    </div>
  );
}

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

function buildCardUrl(params: { name: string; streak: number; workouts: number; calories: number; gainsScore: number }): string {
  const qs = new URLSearchParams({
    name: params.name,
    streak: String(params.streak),
    workouts: String(params.workouts),
    calories: String(params.calories),
    gains_score: String(params.gainsScore),
  });
  return `/api/share-card?${qs.toString()}`;
}
