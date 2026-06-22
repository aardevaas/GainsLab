import Link from 'next/link';
import { ArrowLeft, Users, Calendar, Gift } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Competitions' };

const TYPE_LABELS: Record<string, string> = {
  workouts: 'Most workouts',
  streak: 'Longest streak',
  custom: 'Special challenge',
  steps: 'Most steps',
  calories_burned: 'Most calories burned',
  weight_loss: 'Most weight lost',
};

export default async function CompetitionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const today = new Date().toISOString().split('T')[0];

  const [competitionsRes, myEntriesRes] = await Promise.all([
    supabase
      .from('competitions')
      .select('id, name, description, type, start_date, end_date, prize_description, is_active')
      .order('end_date'),
    supabase
      .from('competition_entries')
      .select('competition_id, score')
      .eq('user_id', user!.id),
  ]);

  const competitions = competitionsRes.data ?? [];
  const myEntryMap = new Map(
    (myEntriesRes.data ?? []).map(e => [e.competition_id, e.score])
  );

  // Group competitions
  const active = competitions.filter(c => c.is_active && c.end_date >= today);
  const past = competitions.filter(c => !c.is_active || c.end_date < today);

  function CompCard({ comp }: { comp: typeof competitions[0] }) {
    const isJoined = myEntryMap.has(comp.id);
    const myScore = myEntryMap.get(comp.id);
    const isOver = comp.end_date < today;
    const daysLeft = Math.max(0, Math.ceil((new Date(comp.end_date).getTime() - Date.now()) / 86400000));

    return (
      <Link
        href={`/community/competitions/${comp.id}`}
        className="block rounded-xl border p-5 transition-all hover:border-[var(--color-accent)]"
        style={{ background: 'var(--color-surface)', borderColor: isJoined ? 'var(--color-accent)' : 'var(--color-border)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {isJoined && (
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
                >
                  Joined
                </span>
              )}
              {isOver && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)' }}>
                  Ended
                </span>
              )}
            </div>

            <h3 className="font-bold text-base" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
              {comp.name}
            </h3>

            {comp.description && (
              <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                {comp.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <Users size={12} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {TYPE_LABELS[comp.type] ?? comp.type}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={12} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {isOver
                    ? `Ended ${new Date(comp.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : `${daysLeft}d left`}
                </span>
              </div>
              {comp.prize_description && (
                <div className="flex items-center gap-1.5">
                  <Gift size={12} style={{ color: '#fbbf24' }} />
                  <span className="text-xs" style={{ color: '#fbbf24' }}>Prize</span>
                </div>
              )}
            </div>
          </div>

          {isJoined && myScore !== undefined && (
            <div className="shrink-0 text-right">
              <div className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.04em' }}>
                {myScore}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>your score</div>
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link href="/community" className="size-8 rounded-lg flex items-center justify-center border" style={{ borderColor: 'var(--color-border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Competitions</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Monthly challenges with real prizes</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-2xl space-y-8">
        {active.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Active now
            </h2>
            <div className="space-y-3">
              {active.map(c => <CompCard key={c.id} comp={c} />)}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Past competitions
            </h2>
            <div className="space-y-3">
              {past.map(c => <CompCard key={c.id} comp={c} />)}
            </div>
          </section>
        )}

        {competitions.length === 0 && (
          <div className="text-center py-16">
            <Users size={32} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <p className="font-semibold" style={{ color: 'var(--color-text)' }}>No competitions yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              The first monthly competition launches soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
