import Link from 'next/link';
import { ArrowLeft, Trophy, Calendar, Gift, Users } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { joinCompetition, leaveCompetition, refreshCompetitionScore } from '../actions';
import { syncMyScores } from '../../actions';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('competitions').select('name').eq('id', id).single();
  return { title: data?.name ?? 'Competition' };
}

const TYPE_LABELS: Record<string, string> = {
  workouts: 'Most workouts completed',
  streak: 'Longest active streak',
  custom: 'Special challenge',
  steps: 'Most steps',
  calories_burned: 'Most calories burned',
  weight_loss: 'Most weight lost',
};

export default async function CompetitionDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [compRes, myScores] = await Promise.all([
    supabase.from('competitions').select('*').eq('id', id).single(),
    syncMyScores(),
  ]);

  if (!compRes.data) notFound();
  const comp = compRes.data;

  // Refresh the user's competition score if they've joined
  await refreshCompetitionScore(id, myScores.streak);

  // Fetch all entries + profiles in parallel
  const [entriesRes] = await Promise.all([
    supabase
      .from('competition_entries')
      .select('user_id, score, joined_at')
      .eq('competition_id', id)
      .order('score', { ascending: false }),
  ]);

  const entries = entriesRes.data ?? [];
  const myEntry = entries.find(e => e.user_id === user?.id);
  const isJoined = !!myEntry;

  const entryUserIds = [...new Set(entries.map(e => e.user_id))];
  const profilesRes = entryUserIds.length
    ? await supabase.from('profiles').select('user_id, name, username').in('user_id', entryUserIds)
    : { data: [] };

  const profileMap = new Map(
    (profilesRes.data ?? []).map(p => [p.user_id, p.name ?? p.username ?? null])
  );

  const myRank = entries.findIndex(e => e.user_id === user?.id) + 1;
  const today = new Date().toISOString().split('T')[0];
  const isOver = comp.end_date < today;
  const daysLeft = Math.max(0, Math.ceil((new Date(comp.end_date).getTime() - Date.now()) / 86400000));

  const RANK_COLORS = ['#fbbf24', '#94a3b8', '#b45309'];

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link href="/community/competitions" className="size-8 rounded-lg flex items-center justify-center border" style={{ borderColor: 'var(--color-border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            {comp.name}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {TYPE_LABELS[comp.type] ?? comp.type}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-2xl space-y-6">
        {/* Competition header card */}
        <div className="rounded-xl border p-5 space-y-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          {comp.description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {comp.description}
            </p>
          )}

          <div className="flex flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {new Date(comp.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' – '}
                {new Date(comp.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {entries.length} {entries.length === 1 ? 'participant' : 'participants'}
              </span>
            </div>
            {!isOver && (
              <div className="flex items-center gap-2">
                <Trophy size={14} style={{ color: 'var(--color-accent)' }} />
                <span className="text-xs" style={{ color: 'var(--color-accent)' }}>
                  {daysLeft}d remaining
                </span>
              </div>
            )}
            {comp.prize_description && (
              <div className="flex items-center gap-2">
                <Gift size={14} style={{ color: '#fbbf24' }} />
                <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>
                  {comp.prize_description}
                </span>
              </div>
            )}
          </div>

          {/* Join / Leave */}
          {!isOver && (
            isJoined ? (
              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Your score</span>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.04em' }}>
                    {myEntry!.score}
                    {myRank > 0 && (
                      <span className="text-sm font-normal ml-2" style={{ color: 'var(--color-accent)' }}>
                        #{myRank}
                      </span>
                    )}
                  </div>
                </div>
                <form action={leaveCompetition.bind(null, id)}>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold border"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                  >
                    Leave competition
                  </button>
                </form>
              </div>
            ) : (
              <form action={joinCompetition.bind(null, id, myScores.streak)} className="pt-2 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
                >
                  Join competition
                </button>
              </form>
            )
          )}

          {isOver && (
            <div className="pt-2 border-t text-center" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)' }}>
                Competition ended
              </span>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Leaderboard
          </h2>

          {entries.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No participants yet. Be the first to join!</p>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              {entries.map((entry, i) => {
                const rank = i + 1;
                const isMe = entry.user_id === user?.id;
                const rankColor = rank <= 3 ? RANK_COLORS[rank - 1] : 'var(--color-text-muted)';
                const displayName = isMe
                  ? 'You'
                  : profileMap.get(entry.user_id) ?? `Athlete #${rank}`;

                return (
                  <div
                    key={entry.user_id}
                    className="flex items-center gap-4 px-5 py-3 border-b last:border-0"
                    style={{
                      borderColor: 'var(--color-border-subtle)',
                      background: isMe ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
                    }}
                  >
                    <div className="w-8 flex items-center justify-center shrink-0">
                      {rank === 1 ? (
                        <Trophy size={16} style={{ color: rankColor }} />
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
                      {entry.score}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
