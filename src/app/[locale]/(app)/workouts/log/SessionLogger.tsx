'use client';

import { useMemo, useState, useEffect, useTransition } from 'react';
import { Plus, Minus, CheckCircle, Check, Loader2, Timer, Trophy, Calculator } from 'lucide-react';
import { completeSession, type ExerciseHistory } from './actions';
import { ExerciseMedia } from '@/components/exercises/ExerciseMedia';
import { RestTimer } from '@/components/workouts/RestTimer';
import { exerciseImageUrls } from '@/lib/exercises/types';
import {
  estimateOneRepMax,
  setVolume,
  platesPerSide,
  DEFAULT_BAR_KG,
} from '@/lib/workouts/training';

type Exercise = {
  id: string;
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: number | null;
  rest_seconds: number;
};

type WorkoutDay = {
  id: string;
  name: string;
  exercises: Exercise[];
};

type SetEntry = {
  weightKg: number;
  reps: number;
  rpe: number | null;
  done: boolean;
  isWarmup: boolean;
};

type Props = {
  planId: string;
  days: WorkoutDay[];
  history: Record<string, ExerciseHistory>;
};

const DEFAULT_REST = 90;

export function SessionLogger({ planId, days, history }: Props) {
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(days[0] ?? null);
  const [sets, setSets] = useState<Record<string, SetEntry[]>>(() =>
    days[0] ? seedDay(days[0], history) : {},
  );
  const [notes, setNotes] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [pending, startTransition] = useTransition();

  // Rest timer trigger
  const [restKey, setRestKey] = useState(0);
  const [restDuration, setRestDuration] = useState(DEFAULT_REST);

  // Which set's plate math is open: `${exRowId}:${idx}`
  const [platesOpen, setPlatesOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [started]);

  function selectDay(day: WorkoutDay) {
    setSelectedDay(day);
    setSets(seedDay(day, history));
    setPlatesOpen(null);
  }

  function patchSet(exId: string, idx: number, patch: Partial<SetEntry>) {
    setSets((prev) => ({
      ...prev,
      [exId]: (prev[exId] ?? []).map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));
  }

  function addSet(exId: string) {
    setSets((prev) => {
      const existing = prev[exId] ?? [];
      const last = existing.at(-1);
      const seed: SetEntry = {
        weightKg: last?.weightKg ?? 0,
        reps: last?.reps ?? 10,
        rpe: null,
        done: false,
        isWarmup: false,
      };
      return { ...prev, [exId]: [...existing, seed] };
    });
  }

  function removeSet(exId: string, idx: number) {
    setSets((prev) => ({
      ...prev,
      [exId]: (prev[exId] ?? []).filter((_, i) => i !== idx),
    }));
  }

  function toggleDone(ex: Exercise, idx: number) {
    const wasDone = sets[ex.id]?.[idx]?.done ?? false;
    patchSet(ex.id, idx, { done: !wasDone });
    // Marking a set complete starts the rest timer and the session clock.
    if (!wasDone) {
      if (!started) setStarted(true);
      setRestDuration(ex.rest_seconds || DEFAULT_REST);
      setRestKey((k) => k + 1);
    }
  }

  const summary = useMemo(
    () => computeSummary(selectedDay, sets, history),
    [selectedDay, sets, history],
  );

  function handleComplete() {
    const payload = collectDoneSets(selectedDay, sets);
    startTransition(async () => {
      await completeSession(planId, payload, Math.round(elapsed / 60), notes);
    });
  }

  if (!selectedDay) {
    return <p style={{ color: 'var(--color-text-muted)' }}>This plan has no days configured.</p>;
  }

  return (
    <div className="space-y-5">
      {/* Day selector */}
      <div className="flex gap-2 flex-wrap">
        {days.map((day) => (
          <button
            key={day.id}
            onClick={() => selectDay(day)}
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

      {/* Session summary bar */}
      <div
        className="grid grid-cols-4 rounded-xl border divide-x"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <Stat icon={<Timer size={14} />} label="Time" value={formatTime(elapsed)} />
        <Stat label="Sets" value={`${summary.doneSets}`} />
        <Stat label="Volume" value={`${Math.round(summary.volume).toLocaleString()} kg`} />
        <Stat label="PRs" value={`${summary.prs}`} accent={summary.prs > 0} />
      </div>

      {/* Exercises */}
      {selectedDay.exercises.map((ex) => {
        const hist = history[ex.exercise_id];
        const exSets = sets[ex.id] ?? [];
        return (
          <div
            key={ex.id}
            className="rounded-xl border overflow-hidden"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <div className="flex items-center gap-3">
                <ExerciseMedia
                  images={exerciseImageUrls(ex.exercise_id)}
                  alt={ex.exercise_name}
                  className="size-14 rounded-lg shrink-0"
                />
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                    {ex.exercise_name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Target: {ex.sets} sets{ex.reps ? ` × ${ex.reps}` : ''}
                    {hist?.bestWeightKg ? ` · best ${hist.bestWeightKg}kg` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => addSet(ex.id)}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
              >
                <Plus size={11} /> Add set
              </button>
            </div>

            {/* Column headers */}
            <div
              className="grid grid-cols-[2rem_4.5rem_1fr_1fr_3rem_2rem] gap-2 px-5 py-2 text-[10px] font-semibold uppercase tracking-wide items-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <span>Set</span>
              <span>Prev</span>
              <span>Kg</span>
              <span>Reps</span>
              <span>RPE</span>
              <span />
            </div>

            {exSets.length === 0 && (
              <div className="px-5 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                No sets — tap “Add set”.
              </div>
            )}

            {exSets.map((s, i) => {
              const prev = hist?.lastSets[i];
              const e1rm = estimateOneRepMax(s.weightKg, s.reps);
              const isPr = !s.isWarmup && (hist?.bestE1rm ?? 0) > 0 && e1rm > (hist?.bestE1rm ?? 0);
              const plateKey = `${ex.id}:${i}`;
              const layout = platesPerSide(s.weightKg);
              return (
                <div key={i}>
                  <div
                    className="grid grid-cols-[2rem_4.5rem_1fr_1fr_3rem_2rem] gap-2 items-center px-5 py-2 border-t"
                    style={{
                      borderColor: 'var(--color-border-subtle)',
                      background: s.done ? 'var(--color-accent-subtle)' : 'transparent',
                    }}
                  >
                    <span
                      className="size-6 flex items-center justify-center rounded-full text-[11px] font-bold"
                      style={{
                        background: s.isWarmup ? 'transparent' : 'var(--color-surface-elevated)',
                        color: s.isWarmup ? 'var(--color-text-muted)' : 'var(--color-text)',
                        border: s.isWarmup ? '1px dashed var(--color-border)' : 'none',
                      }}
                      onClick={() => patchSet(ex.id, i, { isWarmup: !s.isWarmup })}
                      title={s.isWarmup ? 'Warm-up set' : 'Working set — click to mark warm-up'}
                      role="button"
                    >
                      {s.isWarmup ? 'W' : i + 1}
                    </span>

                    <span className="text-[11px] tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                      {prev?.weightKg != null && prev?.reps != null ? `${prev.weightKg}×${prev.reps}` : '—'}
                    </span>

                    <input
                      type="number"
                      min={0}
                      step={1.25}
                      value={s.weightKg}
                      onChange={(e) => patchSet(ex.id, i, { weightKg: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border text-sm text-center outline-none focus:border-[var(--color-accent)]"
                      style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    />
                    <input
                      type="number"
                      min={0}
                      value={s.reps}
                      onChange={(e) => patchSet(ex.id, i, { reps: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border text-sm text-center outline-none focus:border-[var(--color-accent)]"
                      style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={0.5}
                      value={s.rpe ?? ''}
                      placeholder="–"
                      onChange={(e) =>
                        patchSet(ex.id, i, { rpe: e.target.value === '' ? null : Number(e.target.value) })
                      }
                      className="w-full px-1.5 py-1 rounded-lg border text-xs text-center outline-none focus:border-[var(--color-accent)]"
                      style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                    />

                    <button
                      onClick={() => toggleDone(ex, i)}
                      className="size-7 flex items-center justify-center rounded-lg transition-all justify-self-end"
                      style={{
                        background: s.done ? 'var(--color-accent)' : 'var(--color-surface-elevated)',
                        color: s.done ? '#0a0c0f' : 'var(--color-text-muted)',
                      }}
                      title={s.done ? 'Completed' : 'Mark set complete'}
                    >
                      <Check size={14} />
                    </button>
                  </div>

                  {/* Set meta row: e1RM · PR · plate math · remove */}
                  <div
                    className="flex items-center gap-3 px-5 pb-2 text-[10px]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {e1rm > 0 && <span>e1RM {e1rm}kg</span>}
                    {e1rm > 0 && <span>vol {Math.round(setVolume(s.weightKg, s.reps))}</span>}
                    {isPr && (
                      <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--color-accent)' }}>
                        <Trophy size={10} /> PR
                      </span>
                    )}
                    {s.weightKg > DEFAULT_BAR_KG && (
                      <button
                        onClick={() => setPlatesOpen(platesOpen === plateKey ? null : plateKey)}
                        className="flex items-center gap-1"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        <Calculator size={10} /> plates
                      </button>
                    )}
                    <button
                      onClick={() => removeSet(ex.id, i)}
                      className="ml-auto flex items-center gap-0.5"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <Minus size={11} /> remove
                    </button>
                  </div>

                  {platesOpen === plateKey && (
                    <div className="px-5 pb-3 text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>{layout.barKg}kg bar + per side: </span>
                      {layout.perSide.length > 0 ? (
                        layout.perSide.map((p, k) => (
                          <span
                            key={k}
                            className="inline-block mx-0.5 px-1.5 py-0.5 rounded"
                            style={{ background: 'var(--color-surface-elevated)' }}
                          >
                            {p}
                          </span>
                        ))
                      ) : (
                        <span>just the bar</span>
                      )}
                      {layout.remainderKg > 0 && (
                        <span style={{ color: 'var(--color-warning, #fbbf24)' }}> · {layout.remainderKg}kg unloadable</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Rest timer (sticky) */}
      <RestTimer durationSeconds={restDuration} restartKey={restKey} />

      {/* Notes + complete */}
      <div className="space-y-3">
        <textarea
          placeholder="Session notes (optional)…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none focus:border-[var(--color-accent)]"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
        <button
          onClick={handleComplete}
          disabled={pending || summary.doneSets === 0}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
          style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          Complete session{summary.doneSets > 0 ? ` · ${summary.doneSets} sets` : ''}
        </button>
      </div>
    </div>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────

function seedDay(day: WorkoutDay, history: Record<string, ExerciseHistory>): Record<string, SetEntry[]> {
  const out: Record<string, SetEntry[]> = {};
  for (const ex of day.exercises) {
    const last = history[ex.exercise_id]?.lastSets ?? [];
    const count = Math.max(1, ex.sets || 1);
    out[ex.id] = Array.from({ length: count }, (_, i) => {
      const prev = last[i] ?? last.at(-1);
      return {
        weightKg: prev?.weightKg ?? 0,
        reps: prev?.reps ?? ex.reps ?? 10,
        rpe: null,
        done: false,
        isWarmup: false,
      };
    });
  }
  return out;
}

function computeSummary(
  day: WorkoutDay | null,
  sets: Record<string, SetEntry[]>,
  history: Record<string, ExerciseHistory>,
) {
  let doneSets = 0;
  let volume = 0;
  let prs = 0;
  for (const ex of day?.exercises ?? []) {
    const best = history[ex.exercise_id]?.bestE1rm ?? 0;
    for (const s of sets[ex.id] ?? []) {
      if (!s.done) continue;
      doneSets += 1;
      if (s.isWarmup) continue;
      volume += setVolume(s.weightKg, s.reps);
      if (best > 0 && estimateOneRepMax(s.weightKg, s.reps) > best) prs += 1;
    }
  }
  return { doneSets, volume, prs };
}

function collectDoneSets(day: WorkoutDay | null, sets: Record<string, SetEntry[]>) {
  if (!day) return [];
  const payload: {
    exerciseName: string;
    exerciseId: string;
    setNumber: number;
    reps: number | null;
    weightKg: number | null;
    rpe: number | null;
    isWarmup: boolean;
  }[] = [];
  for (const ex of day.exercises) {
    const done = (sets[ex.id] ?? []).filter((s) => s.done);
    done.forEach((s, i) => {
      payload.push({
        exerciseName: ex.exercise_name,
        exerciseId: ex.exercise_id,
        setNumber: i + 1,
        reps: s.reps,
        weightKg: s.weightKg,
        rpe: s.rpe,
        isWarmup: s.isWarmup,
      });
    });
  }
  return payload;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="px-3 py-2.5 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide flex items-center justify-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
        {icon}
        {label}
      </p>
      <p
        className="text-sm font-bold mt-0.5 tabular-nums"
        style={{ color: accent ? 'var(--color-accent)' : 'var(--color-text)' }}
      >
        {value}
      </p>
    </div>
  );
}
