'use client';

import { useState, useEffect, useTransition } from 'react';
import { Plus, Search, Loader2, X, Trash2 } from 'lucide-react';
import type { Exercise } from '@/lib/exercises/types';
import { addExerciseToDay, removeExerciseFromDay, updateDayName } from '../actions';

type WorkoutExercise = {
  id: string;
  exercise_name: string;
  exercise_id: string;
  sets: number;
  reps: number | null;
  rest_seconds: number;
  order: number;
};

type WorkoutDay = {
  id: string;
  day_number: number;
  name: string;
  exercises: WorkoutExercise[];
};

type Props = { days: WorkoutDay[] };

export function WorkoutDayBuilder({ days }: Props) {
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Exercise[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState<number | null>(10);
  const [addPending, startAdd] = useTransition();
  const [removePending, startRemove] = useTransition();
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [dayNameInput, setDayNameInput] = useState('');
  const [renamePending, startRename] = useTransition();

  useEffect(() => {
    if (!query || query.length < 2 || selectedEx || !addingTo) return;
    const id = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/exercises/search?q=${encodeURIComponent(query)}&limit=8`);
      const data = await res.json() as { items: Exercise[] };
      setResults(data.items);
      setSearching(false);
    }, 300);
    return () => clearTimeout(id);
  }, [query, selectedEx, addingTo]);

  function handleAdd(dayId: string) {
    if (!selectedEx) return;
    startAdd(async () => {
      await addExerciseToDay(dayId, selectedEx.name, selectedEx.id, sets, reps);
      setAddingTo(null);
      setQuery('');
      setResults([]);
      setSelectedEx(null);
    });
  }

  function handleRemove(rowId: string) {
    startRemove(async () => {
      await removeExerciseFromDay(rowId);
    });
  }

  function startEditDayName(day: WorkoutDay) {
    setEditingDay(day.id);
    setDayNameInput(day.name);
  }

  function handleRenameDay(dayId: string) {
    if (!dayNameInput.trim()) return;
    startRename(async () => {
      await updateDayName(dayId, dayNameInput.trim());
      setEditingDay(null);
    });
  }

  return (
    <div className="space-y-4">
      {days.map(day => (
        <section
          key={day.id}
          className="rounded-xl border overflow-hidden"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {/* Day header */}
          <div
            className="flex items-center gap-3 px-5 py-3 border-b"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            {editingDay === day.id ? (
              <form
                className="flex items-center gap-2 flex-1"
                onSubmit={e => { e.preventDefault(); handleRenameDay(day.id); }}
              >
                <input
                  autoFocus
                  value={dayNameInput}
                  onChange={e => setDayNameInput(e.target.value)}
                  className="flex-1 px-3 py-1 rounded-lg border text-sm outline-none focus:border-[var(--color-accent)]"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                <button
                  type="submit"
                  disabled={renamePending}
                  className="text-xs font-semibold px-3 py-1 rounded-lg"
                  style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDay(null)}
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <button
                  onClick={() => startEditDayName(day)}
                  className="font-semibold text-sm hover:text-[var(--color-accent)] transition-colors text-left"
                  style={{ color: 'var(--color-text)' }}
                >
                  {day.name}
                </button>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
                </span>
              </>
            )}
            <div className="flex-1" />
            {!addingTo && (
              <button
                onClick={() => { setAddingTo(day.id); setSelectedEx(null); setQuery(''); setResults([]); }}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
              >
                <Plus size={11} /> Add exercise
              </button>
            )}
          </div>

          {/* Exercises */}
          {day.exercises.length > 0 && (
            <div className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {day.exercises.map(ex => (
                <div key={ex.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                      {ex.exercise_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {ex.sets} sets{ex.reps ? ` × ${ex.reps} reps` : ''} · {ex.rest_seconds}s rest
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(ex.id)}
                    disabled={removePending}
                    className="size-7 flex items-center justify-center rounded-lg hover:text-red-400 transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {day.exercises.length === 0 && addingTo !== day.id && (
            <div className="px-5 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No exercises yet
            </div>
          )}

          {/* Add exercise panel */}
          {addingTo === day.id && (
            <div className="p-4 space-y-3" style={{ background: 'var(--color-surface-elevated)' }}>
              {!selectedEx ? (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search exercises..."
                    value={query}
                    onChange={e => { setQuery(e.target.value); setResults([]); }}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none focus:border-[var(--color-accent)]"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                  {searching && (
                    <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
                    style={{ background: 'var(--color-bg)', borderColor: 'var(--color-accent)', color: 'var(--color-text)' }}
                  >
                    <span className="flex-1 truncate">{selectedEx.name}</span>
                    <button onClick={() => { setSelectedEx(null); setQuery(''); }} style={{ color: 'var(--color-text-muted)' }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {results.length > 0 && !selectedEx && (
                <div
                  className="rounded-lg border divide-y overflow-hidden"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
                >
                  {results.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => setSelectedEx(ex)}
                      className="w-full flex items-center gap-4 px-4 py-2.5 text-left text-sm hover:bg-[var(--color-surface)] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium" style={{ color: 'var(--color-text)' }}>{ex.name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {ex.primaryMuscles.slice(0, 2).join(', ')}
                        </p>
                      </div>
                      <span className="text-xs capitalize shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                        {ex.equipment ?? 'body only'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {selectedEx && (
                <div className="flex items-center gap-3">
                  <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Sets</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={sets}
                    onChange={e => setSets(Number(e.target.value))}
                    className="w-16 px-2 py-1.5 rounded-lg border text-sm text-center outline-none"
                    style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                  <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Reps</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={reps ?? ''}
                    placeholder="—"
                    onChange={e => setReps(e.target.value ? Number(e.target.value) : null)}
                    className="w-16 px-2 py-1.5 rounded-lg border text-sm text-center outline-none"
                    style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleAdd(day.id)}
                  disabled={!selectedEx || addPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                  style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
                >
                  {addPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Add exercise
                </button>
                <button
                  onClick={() => { setAddingTo(null); setQuery(''); setResults([]); setSelectedEx(null); }}
                  className="px-4 py-2 rounded-lg text-sm border"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
