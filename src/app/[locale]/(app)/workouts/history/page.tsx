import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Dumbbell, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { estimateOneRepMax, setVolume } from '@/lib/workouts/training';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Workout History' };

type SessionSetRow = {
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  is_warmup: boolean | null;
};

export default async function WorkoutHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [sessionsRes, plansRes] = await Promise.all([
    supabase
      .from('workout_sessions')
      .select('id, plan_id, date, duration_minutes, notes, completed')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('date', { ascending: false })
      .limit(50),
    supabase.from('workout_plans').select('id, name').eq('user_id', user.id),
  ]);

  const sessions = sessionsRes.data ?? [];
  const planNameById = new Map((plansRes.data ?? []).map(p => [p.id, p.name]));

  const sessionIds = sessions.map(s => s.id);
  const setsRes = sessionIds.length
    ? await supabase
        .from('session_sets')
        .select('session_id, exercise_id, exercise_name, set_number, reps, weight_kg, is_warmup')
        .in('session_id', sessionIds)
    : { data: [] as SessionSetRow[] };

  const setsBySession = new Map<string, SessionSetRow[]>();
  for (const row of (setsRes.data ?? []) as SessionSetRow[]) {
    const list = setsBySession.get(row.session_id) ?? [];
    list.push(row);
    setsBySession.set(row.session_id, list);
  }

  // Personal-best e1RM per exercise, computed in chronological order so we can
  // flag which sessions actually set a new PR (vs. just matching a past one).
  const bestByExercise = new Map<string, number>();
  const sessionsChronological = [...sessions].reverse();
  const prCountBySession = new Map<string, number>();
  for (const session of sessionsChronological) {
    const sets = setsBySession.get(session.id) ?? [];
    let prs = 0;
    for (const s of sets) {
      if (s.is_warmup) continue;
      const e1rm = estimateOneRepMax(s.weight_kg ?? 0, s.reps ?? 0);
      const best = bestByExercise.get(s.exercise_id) ?? 0;
      if (e1rm > best) {
        bestByExercise.set(s.exercise_id, e1rm);
        prs += 1;
      }
    }
    prCountBySession.set(session.id, prs);
  }

  return (
    <div className="flex flex-col min-h-full">
      <div
        className="px-8 py-5 border-b flex items-center gap-4"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <Link
          href="/workouts"
          className="size-8 rounded-lg flex items-center justify-center border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Workout History
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} logged
          </p>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 max-w-2xl">
        {sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {sessions.map(session => {
              const sets = (setsBySession.get(session.id) ?? []).filter(s => !s.is_warmup);
              const volume = sets.reduce((acc, s) => acc + setVolume(s.weight_kg ?? 0, s.reps ?? 0), 0);
              const exerciseNames = [...new Set(sets.map(s => s.exercise_name))];
              const prs = prCountBySession.get(session.id) ?? 0;
              const planName = session.plan_id ? planNameById.get(session.plan_id) : null;

              return (
                <div
                  key={session.id}
                  className="rounded-xl border p-5"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                        {planName ?? 'Freestyle session'}
                      </p>
                      <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                        <Calendar size={11} /> {formatDate(`${session.date}T00:00:00`)}
                      </p>
                    </div>
                    {prs > 0 && (
                      <span
                        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full"
                        style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
                      >
                        <Trophy size={10} /> {prs} PR{prs !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {session.duration_minutes != null && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={11} /> {session.duration_minutes} min
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Dumbbell size={11} /> {sets.length} set{sets.length !== 1 ? 's' : ''}
                    </span>
                    {volume > 0 && <span>{Math.round(volume).toLocaleString()} kg volume</span>}
                  </div>

                  {exerciseNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {exerciseNames.slice(0, 6).map(name => (
                        <span
                          key={name}
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)' }}
                        >
                          {name}
                        </span>
                      ))}
                      {exerciseNames.length > 6 && (
                        <span className="text-[10px] px-2 py-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          +{exerciseNames.length - 6} more
                        </span>
                      )}
                    </div>
                  )}

                  {session.notes && (
                    <p className="text-xs mt-3 italic" style={{ color: 'var(--color-text-muted)' }}>
                      "{session.notes}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-xl border p-12 flex flex-col items-center gap-4 text-center max-w-md mx-auto mt-8"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div
        className="size-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--color-surface-elevated)' }}
      >
        <Dumbbell size={28} style={{ color: 'var(--color-accent)' }} />
      </div>
      <div>
        <p className="font-semibold" style={{ color: 'var(--color-text)' }}>No sessions logged yet</p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Complete a workout to start building your training log.
        </p>
      </div>
      <Link
        href="/workouts"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
        style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
      >
        Go to workouts
      </Link>
    </div>
  );
}
