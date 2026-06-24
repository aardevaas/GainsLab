'use client';

import { useState, useEffect, useTransition } from 'react';
import { Plus, Minus, CheckCircle, Loader2, Timer } from 'lucide-react';
import { completeSession } from './actions';
import { ExerciseMedia } from '@/components/exercises/ExerciseMedia';
import { exerciseImageUrls } from '@/lib/exercises/types';

type Exercise = {
  id: string;
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: number | null;
};

type WorkoutDay = {
  id: string;
  name: string;
  exercises: Exercise[];
};

type SetLog = {
  exerciseName: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
};

type Props = {
  planId: string;
  days: WorkoutDay[];
};

export function SessionLogger({ planId, days }: Props) {
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(days[0] ?? null);
  const [sets, setSets] = useState<Record<string, SetLog[]>>({});
  const [notes, setNotes] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [started]);

  function formatTime(sec: number): string {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function addSet(exId: string, exName: string, exerciseId: string) {
    setSets(prev => {
      const existing = prev[exId] ?? [];
      const prevSet = existing.at(-1);
      const newSet: SetLog = {
        exerciseName: exName,
        exerciseId,
        setNumber: existing.length + 1,
        reps: prevSet?.reps ?? 10,
        weightKg: prevSet?.weightKg ?? 0,
      };
      return { ...prev, [exId]: [...existing, newSet] };
    });
  }

  function removeSet(exId: string, idx: number) {
    setSets(prev => {
      const updated = (prev[exId] ?? []).filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, setNumber: i + 1 }));
      return { ...prev, [exId]: updated };
    });
  }

  function updateSet(exId: string, idx: number, field: 'reps' | 'weightKg', val: number) {
    setSets(prev => {
      const updated = (prev[exId] ?? []).map((s, i) => i === idx ? { ...s, [field]: val } : s);
      return { ...prev, [exId]: updated };
    });
  }

  function handleComplete() {
    const allSets = Object.values(sets).flat();
    startTransition(async () => {
      await completeSession(planId, allSets, Math.round(elapsed / 60), notes);
    });
  }

  if (!selectedDay) {
    return <p style={{ color: 'var(--color-text-muted)' }}>This plan has no days configured.</p>;
  }

  return (
    <div className="space-y-5">
      {/* Day selector */}
      <div className="flex gap-2 flex-wrap">
        {days.map(day => (
          <button
            key={day.id}
            onClick={() => { setSelectedDay(day); setSets({}); }}
            className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all"
            style={{
              borderColor: selectedDay.id === day.id ? 'var(--color-accent)' : 'var(--color-border)',
              background: selectedDay.id === day.id ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
              color: selectedDay.id === day.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            }}
          >
            {day.name}
          </button>
        ))}
      </div>

      {/* Timer */}
      <div
        className="flex items-center justify-between px-5 py-3 rounded-xl border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <Timer size={16} style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-lg font-mono font-bold" style={{ color: 'var(--color-text)' }}>
            {formatTime(elapsed)}
          </span>
        </div>
        {!started ? (
          <button
            onClick={() => setStarted(true)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
          >
            Start timer
          </button>
        ) : (
          <span className="text-xs" style={{ color: 'var(--color-accent)' }}>Running</span>
        )}
      </div>

      {/* Exercises */}
      {selectedDay.exercises.map(ex => (
        <div
          key={ex.id}
          className="rounded-xl border overflow-hidden"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <div className="flex items-center gap-3">
              <ExerciseMedia
                images={exerciseImageUrls(ex.exercise_id)}
                alt={ex.exercise_name}
                className="size-14 rounded-lg shrink-0"
              />
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{ex.exercise_name}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Target: {ex.sets} sets{ex.reps ? ` × ${ex.reps} reps` : ''}</p>
              </div>
            </div>
            <button
              onClick={() => addSet(ex.id, ex.exercise_name, ex.exercise_id)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
            >
              <Plus size={11} /> Add set
            </button>
          </div>

          {(sets[ex.id] ?? []).length > 0 && (
            <div>
              <div
                className="grid grid-cols-4 px-5 py-2 text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <span>Set</span><span>Reps</span><span>Weight (kg)</span><span />
              </div>
              {(sets[ex.id] ?? []).map((s, i) => (
                <div key={i} className="grid grid-cols-4 items-center gap-2 px-5 py-2 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <span
                    className="size-6 flex items-center justify-center rounded-full text-[11px] font-bold"
                    style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text)' }}
                  >
                    {s.setNumber}
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={s.reps}
                    onChange={e => updateSet(ex.id, i, 'reps', Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded-lg border text-sm text-center outline-none"
                    style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={s.weightKg}
                    onChange={e => updateSet(ex.id, i, 'weightKg', Number(e.target.value))}
                    className="w-20 px-2 py-1 rounded-lg border text-sm text-center outline-none"
                    style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                  <button onClick={() => removeSet(ex.id, i)} className="justify-self-end" style={{ color: 'var(--color-text-muted)' }}>
                    <Minus size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {(sets[ex.id] ?? []).length === 0 && (
            <div className="px-5 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              No sets logged yet
            </div>
          )}
        </div>
      ))}

      {/* Notes + complete */}
      <div className="space-y-3">
        <textarea
          placeholder="Session notes (optional)..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none focus:border-[var(--color-accent)]"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
        <button
          onClick={handleComplete}
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
          style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          Complete session
        </button>
      </div>
    </div>
  );
}
