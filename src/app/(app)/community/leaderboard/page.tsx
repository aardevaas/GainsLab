import Link from 'next/link';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { syncMyScores } from '../actions';
import { requirePro } from '@/lib/payments/gate';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Leaderboard' };

type SearchParams = Promise<{ category?: string }>;

const CATEGORIES = {
  gains_score: { db: 'gains_score', period: 'all_time' as const, label: 'Gains Score', unit: 'pts', description: 'Overall fitness score — nutrition, training, consistency & more' },
  workouts: { db: 'workouts_weekly', period: 'weekly' as const, label: 'Workouts', unit: 'sessions', description: 'Workout sessions completed this week' },
  nutrition: { db: 'nutrition_weekly', period: 'weekly' as const, label: 'Nutrition', unit: 'days', description: 'Days with food logged this week' },
  streak: { db: 'streak', period: 'all_time' as const, label: 'Streak', unit: 'days', description: 'Consecutive active days' },
} as const;

type CategoryKey = keyof typeof CATEGORIES;

export default async function LeaderboardPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePro();
  const { category: rawCat = 'gains_score' } = await searchParams;
  const catKey: CategoryKey = rawCat in CATEGORIES ? (rawCat as CategoryKey) : 'workouts';
  const cat = CATEGORIES[catKey];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [, scoresRes] = await Promise.all([
    syncMyScores(),
    supabase
      .from('leaderboard_scores')
      .select('user_id, score')
      .eq('category', cat.db)
      .eq('period', cat.period)
      .order('score', { ascending: false })
      .limit(50),
  ]);

  const rows = scoresRes.data ?? [];
  const userIds = [...new Set(rows.map(r => r.user_id))];

  const profilesRes = userIds.length
    ? await supabase.from('profiles').select('user_id, name, username').in('user_id', userIds)
    : { data: [] };

  const profileMap = new Map(
    (profilesRes.data ?? []).map(p => [p.user_id, p.name ?? p.username ?? null])
  );

  const myRank = rows.findIndex(r => r.user_id === user?.id) + 1;
  const myRow = rows.find(r => r.user_id === user?.id);

  const RANK_COLORS = ['#fbbf24', '#94a3b8', '#b45309'];

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link href="/community" className="size-8 rounded-lg flex items-center justify-center border" style={{ borderColor: 'var(--color-border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Leaderboard</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{cat.description}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-2xl space-y-6">
        {/* Category tabs */}
        <div className="flex gap-2">
          {Object.entries(CATEGORIES).map(([key, val]) => (
            <Link
              key={key}
              href={`/community/leaderboard?category=${key}`}
              className="px-4 py-2 rounded-lg text-xs font-semibold border transition-all"
              style={{
                borderColor: catKey === key ? 'var(--color-accent)' : 'var(--color-border)',
                background: catKey === key ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
                color: catKey === key ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }}
            >
              {val.label}
            </Link>
          ))}
        </div>

        {/* My rank banner when outside top 10 */}
        {myRow && myRank > 10 && (
          <div
            className="rounded-xl border px-5 py-3 flex items-center justify-between"
            style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent)' }}
          >
            <span className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>Your rank: #{myRank}</span>
            <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
              {myRow.score} {cat.unit}
            </span>
          </div>
        )}

        {/* Rankings */}
        {rows.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={32} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <p className="font-semibold" style={{ color: 'var(--color-text)' }}>No scores yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Be the first — log food or complete a workout to appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            {rows.map((row, i) => {
              const rank = i + 1;
              const isMe = row.user_id === user?.id;
              const rankColor = rank <= 3 ? RANK_COLORS[rank - 1] : 'var(--color-text-muted)';
              const displayName = isMe
                ? 'You'
                : profileMap.get(row.user_id) ?? `Athlete #${rank}`;

              return (
                <div
                  key={row.user_id}
                  className="flex items-center gap-4 px-5 py-3 border-b last:border-0"
                  style={{
                    borderColor: 'var(--color-border-subtle)',
                    background: isMe ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
                  }}
                >
                  <div className="w-8 flex items-center justify-center shrink-0">
                    {rank === 1 ? (
                      <Trophy size={16} style={{ color: rankColor }} />
                    ) : rank <= 3 ? (
                      <Medal size={16} style={{ color: rankColor }} />
                    ) : (
                      <span className="text-sm font-semibold tabular-nums" style={{ color: rankColor }}>{rank}</span>
                    )}
                  </div>

                  <div
                    className="size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: isMe ? 'var(--color-accent)' : 'var(--color-surface-elevated)',
                      color: isMe ? '#0a0c0f' : 'var(--color-text-muted)',
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>

                  <span
                    className="flex-1 text-sm font-semibold truncate"
                    style={{ color: isMe ? 'var(--color-accent)' : 'var(--color-text)' }}
                  >
                    {displayName}
                  </span>

                  <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: 'var(--color-text)' }}>
                    {row.score}
                    <span className="text-xs font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
                      {cat.unit}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {rows.length === 1 && rows[0].user_id === user?.id && (
          <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Share your progress card to invite friends to compete.
          </p>
        )}
      </div>
    </div>
  );
}
