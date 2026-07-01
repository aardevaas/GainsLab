import Link from 'next/link';
import { Plus, Dumbbell, Calendar, ChevronRight, Trash2, History } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { deletePlan } from './actions';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Workouts' };

const DIFFICULTY_COLORS = {
  beginner: { bg: 'rgba(74,222,128,0.1)', text: '#4ade80' },
  intermediate: { bg: 'rgba(251,191,36,0.1)', text: '#fbbf24' },
  advanced: { bg: 'rgba(248,113,113,0.1)', text: '#f87171' },
};

export default async function WorkoutsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [plansRes, sessionsRes] = await Promise.all([
    supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('workout_sessions')
      .select('plan_id, date')
      .eq('user_id', user.id)
      .eq('completed', true)
      .not('plan_id', 'is', null)
      .order('date', { ascending: false }),
  ]);

  const plans = plansRes.data;

  // First match per plan wins — sessions are already sorted newest first.
  const lastTrainedByPlan = new Map<string, string>();
  for (const s of sessionsRes.data ?? []) {
    if (s.plan_id && !lastTrainedByPlan.has(s.plan_id)) {
      lastTrainedByPlan.set(s.plan_id, s.date);
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <div
        className="px-8 py-6 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Workouts
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {plans?.length ?? 0} plan{plans?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/workouts/history"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <History size={14} /> History
          </Link>
          <Link
            href="/workouts/create"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
          >
            <Plus size={14} /> New plan
          </Link>
        </div>
      </div>

      <div className="flex-1 px-8 py-6">
        {!plans?.length ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
          {plans.map(plan => {
            const colors = plan.difficulty
              ? DIFFICULTY_COLORS[plan.difficulty as keyof typeof DIFFICULTY_COLORS]
              : null;
            return (
              <div
                key={plan.id}
                className="rounded-xl border overflow-hidden"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <Link
                  href={`/workouts/${plan.id}`}
                  className="flex items-center gap-4 p-5 group"
                >
                  <div
                    className="size-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'var(--color-surface-elevated)' }}
                  >
                    <Dumbbell size={20} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{plan.name}</p>
                    {plan.description && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {plan.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                        <Calendar size={11} /> {plan.days_per_week}x / week
                      </span>
                      {plan.goal && (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{plan.goal}</span>
                      )}
                      {colors && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full capitalize font-semibold"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {plan.difficulty}
                        </span>
                      )}
                      {lastTrainedByPlan.has(plan.id) && (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          Last trained {formatDate(`${lastTrainedByPlan.get(plan.id)}T00:00:00`)}
                        </span>
                      )}
                      {!lastTrainedByPlan.has(plan.id) && (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          Not trained yet
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                </Link>
                <div
                  className="border-t flex items-center gap-2 px-5 py-2"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                >
                  <Link
                    href={`/workouts/${plan.id}`}
                    className="text-xs font-semibold"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    Edit plan
                  </Link>
                  <span style={{ color: 'var(--color-border)' }}>·</span>
                  <Link
                    href={`/workouts/log?plan=${plan.id}`}
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Log session
                  </Link>
                  <div className="flex-1" />
                  <form action={deletePlan.bind(null, plan.id)}>
                    <button
                      type="submit"
                      className="size-7 flex items-center justify-center rounded-lg transition-colors hover:text-red-400"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
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
        <p className="font-semibold" style={{ color: 'var(--color-text)' }}>No workout plans yet</p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Create your first plan and start training with purpose.
        </p>
      </div>
      <Link
        href="/workouts/create"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
        style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
      >
        <Plus size={14} /> Create plan
      </Link>
    </div>
  );
}
