import Link from 'next/link';
import { Trophy, Users, Share2, Zap, Flame, Dumbbell } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { syncMyScores } from './actions';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Community' };

export default async function CommunityPage() {
  const supabase = await createClient();

  const [scores, competitionsRes] = await Promise.all([
    syncMyScores(),
    supabase
      .from('competitions')
      .select('id, name, type, end_date, prize_description')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('end_date')
      .limit(1),
  ]);

  const featured = competitionsRes.data?.[0] ?? null;

  const TYPE_LABELS: Record<string, string> = {
    workouts: 'Most workouts',
    streak: 'Longest streak',
    custom: 'Special challenge',
    steps: 'Most steps',
    calories_burned: 'Most calories burned',
    weight_loss: 'Most weight lost',
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
          Community
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Compete, connect, and share your progress
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 max-w-4xl">
        {/* Stat strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Current streak', value: scores.streak, unit: scores.streak === 1 ? 'day' : 'days', icon: Flame, color: 'var(--color-accent)' },
            { label: 'Workouts this week', value: scores.workoutsWeekly, unit: scores.workoutsWeekly === 1 ? 'session' : 'sessions', icon: Dumbbell, color: '#a78bfa' },
            { label: 'Nutrition days', value: scores.nutritionWeekly, unit: 'of 7 this week', icon: Zap, color: '#60a5fa' },
          ].map(card => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-xl border p-4"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={14} style={{ color: card.color }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{card.label}</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.04em' }}>
                    {card.value}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{card.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Featured competition */}
        {featured && (
          <Link
            href={`/community/competitions/${featured.id}`}
            className="block rounded-xl border p-5 transition-all hover:border-[var(--color-accent)]"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-accent)' }}>
                  Active competition
                </div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                  {featured.name}
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {TYPE_LABELS[featured.type] ?? featured.type} · ends{' '}
                  {new Date(featured.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                {featured.prize_description && (
                  <p className="text-xs mt-2 font-medium" style={{ color: '#fbbf24' }}>
                    Prize: {featured.prize_description}
                  </p>
                )}
              </div>
              <span
                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
              >
                View →
              </span>
            </div>
          </Link>
        )}

        {/* Nav cards */}
        <div className="grid grid-cols-1 gap-4">
          {[
            {
              href: '/community/leaderboard',
              icon: Trophy,
              title: 'Leaderboard',
              description: 'See how your workouts and consistency rank against other athletes this week.',
              color: '#fbbf24',
            },
            {
              href: '/community/competitions',
              icon: Users,
              title: 'Competitions',
              description: 'Join monthly challenges. Top performers earn prizes and GainsLab Pro subscriptions.',
              color: '#f472b6',
            },
            {
              href: '/community/share',
              icon: Share2,
              title: 'Share Progress',
              description: 'Generate your weekly summary card — shareable on Instagram, Twitter, or anywhere.',
              color: 'var(--color-accent)',
            },
          ].map(card => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="flex items-start gap-4 rounded-xl border p-5 transition-all hover:border-[var(--color-accent)]"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="shrink-0 size-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{card.title}</h3>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{card.description}</p>
                </div>
                <span className="text-sm shrink-0" style={{ color: 'var(--color-text-muted)' }}>→</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
