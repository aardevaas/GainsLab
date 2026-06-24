'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Plus, Check, Loader2, CalendarPlus } from 'lucide-react';
import { useToast } from '@/components/ui/toast/ToastProvider';
import { getMyPlansForPicker, type PlanForPicker } from '@/app/(app)/exercises/actions';
import { addExerciseToDay } from '@/app/(app)/workouts/actions';

type Props = {
  exerciseId: string;
  exerciseName: string;
};

/** Adds an exercise to one of the user's workout-plan days, with sets/reps. */
export function AddToPlan({ exerciseId, exerciseName }: Props) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState<PlanForPicker[] | null>(null);
  const [dayId, setDayId] = useState('');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!open || plans !== null) return;
    getMyPlansForPicker().then((p) => {
      setPlans(p);
      const firstDay = p[0]?.days[0]?.id ?? '';
      setDayId(firstDay);
    });
  }, [open, plans]);

  function handleAdd() {
    if (!dayId) return;
    startTransition(async () => {
      try {
        await addExerciseToDay(dayId, exerciseName, exerciseId, sets, reps);
        toast.success(`Added ${exerciseName} to your plan`);
        setAdded(true);
        setOpen(false);
      } catch {
        toast.error('Could not add to plan');
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
        style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
      >
        {added ? <Check size={15} /> : <Plus size={15} />}
        {added ? 'Added — add again' : 'Add to a plan'}
      </button>
    );
  }

  const hasPlans = plans && plans.length > 0;

  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {plans === null && (
        <p className="text-xs flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
          <Loader2 size={13} className="animate-spin" /> Loading your plans…
        </p>
      )}

      {plans !== null && !hasPlans && (
        <div className="flex flex-col items-center gap-3 py-3 text-center">
          <CalendarPlus size={22} style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            You have no workout plans yet.
          </p>
          <Link
            href="/workouts/create"
            className="px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
          >
            Create a plan
          </Link>
        </div>
      )}

      {hasPlans && (
        <>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Day
            </span>
            <select
              value={dayId}
              onChange={(e) => setDayId(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              {plans.map((p) => (
                <optgroup key={p.id} label={p.name}>
                  {p.days.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <div className="flex gap-3">
            <label className="flex-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                Sets
              </span>
              <input
                type="number"
                min={1}
                value={sets}
                onChange={(e) => setSets(Math.max(1, Number(e.target.value)))}
                className="mt-1 w-full px-3 py-2 rounded-lg border text-sm text-center outline-none"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </label>
            <label className="flex-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                Reps
              </span>
              <input
                type="number"
                min={1}
                value={reps}
                onChange={(e) => setReps(Math.max(1, Number(e.target.value)))}
                className="mt-1 w-full px-3 py-2 rounded-lg border text-sm text-center outline-none"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </label>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={pending || !dayId}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
            >
              {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add
            </button>
          </div>
        </>
      )}
    </div>
  );
}
