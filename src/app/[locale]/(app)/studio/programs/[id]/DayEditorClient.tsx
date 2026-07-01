'use client';

import { useEffect, useState, useTransition } from 'react';
import { loadDayContent, saveDayExercises, saveDayNutrition, toggleDayRest, updateDayTitle } from './actions';
import { Plus, Trash2, ChevronUp, ChevronDown, Check, Loader2, Moon } from 'lucide-react';

type ExerciseEntry = {
  localId: string;
  exercise_name: string;
  sets: string;
  reps: string;
  weight_guidance: string;
  rest_seconds: string;
  notes: string;
};

type NutritionEntry = {
  calorie_target: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  meal_timing_notes: string;
};

function newExercise(): ExerciseEntry {
  return {
    localId: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    exercise_name: '',
    sets: '3',
    reps: '8-12',
    weight_guidance: '',
    rest_seconds: '90',
    notes: '',
  };
}

const inputCls: React.CSSProperties = {
  background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-border)',
  borderRadius: 7, padding: '6px 9px',
  fontSize: 12, color: 'var(--color-text)', outline: 'none', fontFamily: 'inherit',
  width: '100%',
};

const labelCls: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.08em', color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 4,
};

type Props = {
  dayId: string;
  dayNumber: number;
  weekNumber: number;
  initialTitle: string | null;
  initialIsRest: boolean;
  onRestToggled: (dayId: string, isRest: boolean) => void;
};

export function DayEditorClient({ dayId, dayNumber, weekNumber, initialTitle, initialIsRest, onRestToggled }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isRest, setIsRest] = useState(initialIsRest);
  const [dayTitle, setDayTitle] = useState(initialTitle ?? `Day ${dayNumber}`);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [nutrition, setNutrition] = useState<NutritionEntry>({
    calorie_target: '', protein_g: '', carbs_g: '', fat_g: '', meal_timing_notes: '',
  });
  const [, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadDayContent(dayId).then(({ exercises: ex, nutrition: nutr }) => {
      if (!active) return;
      setExercises(ex.map(e => ({
        localId: e.id,
        exercise_name: e.exercise_name,
        sets: String(e.sets ?? 3),
        reps: e.reps ?? '8-12',
        weight_guidance: e.weight_guidance ?? '',
        rest_seconds: String(e.rest_seconds ?? 90),
        notes: e.notes ?? '',
      })));
      if (nutr) {
        setNutrition({
          calorie_target: nutr.calorie_target != null ? String(nutr.calorie_target) : '',
          protein_g: nutr.protein_g != null ? String(nutr.protein_g) : '',
          carbs_g: nutr.carbs_g != null ? String(nutr.carbs_g) : '',
          fat_g: nutr.fat_g != null ? String(nutr.fat_g) : '',
          meal_timing_notes: nutr.meal_timing_notes ?? '',
        });
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [dayId]);

  function updateExercise(localId: string, field: keyof ExerciseEntry, value: string) {
    setExercises(prev => prev.map(e => e.localId === localId ? { ...e, [field]: value } : e));
    setSavedAt(null);
  }

  function addExercise() {
    setExercises(prev => [...prev, newExercise()]);
    setSavedAt(null);
  }

  function removeExercise(localId: string) {
    setExercises(prev => prev.filter(e => e.localId !== localId));
    setSavedAt(null);
  }

  function moveExercise(localId: string, dir: -1 | 1) {
    setExercises(prev => {
      const idx = prev.findIndex(e => e.localId === localId);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
    setSavedAt(null);
  }

  async function handleRestToggle(val: boolean) {
    setIsRest(val);
    onRestToggled(dayId, val);
    startTransition(async () => {
      await toggleDayRest(dayId, val);
    });
  }

  async function handleSave() {
    setSaving(true);
    const exSave = exercises
      .filter(e => e.exercise_name.trim())
      .map((e, i) => ({
        exercise_name: e.exercise_name.trim(),
        sets: e.sets ? Number(e.sets) : null,
        reps: e.reps.trim() || null,
        weight_guidance: e.weight_guidance.trim() || null,
        rest_seconds: e.rest_seconds ? Number(e.rest_seconds) : null,
        notes: e.notes.trim() || null,
        order_index: i,
      }));
    const nutrSave = {
      calorie_target: nutrition.calorie_target ? Number(nutrition.calorie_target) : null,
      protein_g: nutrition.protein_g ? Number(nutrition.protein_g) : null,
      carbs_g: nutrition.carbs_g ? Number(nutrition.carbs_g) : null,
      fat_g: nutrition.fat_g ? Number(nutrition.fat_g) : null,
      meal_timing_notes: nutrition.meal_timing_notes.trim() || null,
    };

    const [exRes, nutrRes] = await Promise.all([
      saveDayExercises(dayId, exSave),
      saveDayNutrition(dayId, nutrSave),
    ]);

    setSaving(false);
    if (!exRes?.error && !nutrRes?.error) setSavedAt(new Date());
  }

  const sectionHead: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.12em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)',
    marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--color-border-subtle)',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 8, color: 'var(--color-text-muted)' }}>
        <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: 13 }}>Loading day content…</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Day header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', margin: '0 0 4px' }}>
            Week {weekNumber} · Day {dayNumber}
          </p>
          <input
            value={dayTitle}
            onChange={e => { setDayTitle(e.target.value); setSavedAt(null); }}
            onBlur={() => { startTransition(async () => { await updateDayTitle(dayId, dayTitle); }); }}
            style={{
              fontSize: 20, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em',
              background: 'transparent', border: 'none', outline: 'none', padding: 0, fontFamily: 'inherit',
            }}
          />
        </div>
        {/* Rest day toggle */}
        <button
          type="button"
          onClick={() => handleRestToggle(!isRest)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 9,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            border: isRest ? '1px solid rgba(251,191,36,0.4)' : '1px solid var(--color-border)',
            background: isRest ? 'rgba(251,191,36,0.08)' : 'var(--color-surface-elevated)',
            color: isRest ? '#fbbf24' : 'var(--color-text-secondary)',
            transition: 'all 150ms ease',
          }}
        >
          <Moon size={13} />
          {isRest ? 'Rest Day' : 'Mark as Rest'}
        </button>
      </div>

      {isRest ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 200, gap: 10, textAlign: 'center',
          border: '1px dashed rgba(251,191,36,0.25)', borderRadius: 14,
          background: 'rgba(251,191,36,0.03)',
        }}>
          <Moon size={28} style={{ color: '#fbbf24', opacity: 0.5 }} />
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            Rest day — no exercises scheduled.
          </p>
          <button type="button" onClick={() => handleRestToggle(false)}
            style={{ fontSize: 12, color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Convert to training day
          </button>
        </div>
      ) : (
        <>
          {/* Exercises */}
          <section>
            <p style={sectionHead}>Exercises</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {exercises.length === 0 && (
                <div style={{
                  padding: '28px 20px', textAlign: 'center', borderRadius: 10,
                  border: '1px dashed var(--color-border)', color: 'var(--color-text-muted)', fontSize: 13,
                }}>
                  No exercises yet. Add your first one below.
                </div>
              )}
              {exercises.map((ex, idx) => (
                <div key={ex.localId} style={{
                  background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
                  borderRadius: 10, padding: '12px 14px',
                }}>
                  {/* Row 1: name + controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button type="button" onClick={() => moveExercise(ex.localId, -1)} disabled={idx === 0}
                        style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: 1, opacity: idx === 0 ? 0.3 : 0.7 }}>
                        <ChevronUp size={12} style={{ color: 'var(--color-text-muted)' }} />
                      </button>
                      <button type="button" onClick={() => moveExercise(ex.localId, 1)} disabled={idx === exercises.length - 1}
                        style={{ background: 'none', border: 'none', cursor: idx === exercises.length - 1 ? 'not-allowed' : 'pointer', padding: 1, opacity: idx === exercises.length - 1 ? 0.3 : 0.7 }}>
                        <ChevronDown size={12} style={{ color: 'var(--color-text-muted)' }} />
                      </button>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', minWidth: 20 }}>
                      {idx + 1}
                    </span>
                    <input
                      value={ex.exercise_name}
                      onChange={e => updateExercise(ex.localId, 'exercise_name', e.target.value)}
                      placeholder="Exercise name…"
                      style={{ ...inputCls, flex: 1, fontSize: 13, fontWeight: 600, padding: '7px 10px' }}
                    />
                    <button type="button" onClick={() => removeExercise(ex.localId)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, opacity: 0.5 }}>
                      <Trash2 size={13} style={{ color: '#f87171' }} />
                    </button>
                  </div>
                  {/* Row 2: metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 100px 130px 90px 1fr', gap: 8, paddingLeft: 44 }}>
                    <div>
                      <label style={labelCls}>Sets</label>
                      <input type="number" min="1" value={ex.sets}
                        onChange={e => updateExercise(ex.localId, 'sets', e.target.value)}
                        style={inputCls} />
                    </div>
                    <div>
                      <label style={labelCls}>Reps</label>
                      <input value={ex.reps} placeholder="8-12"
                        onChange={e => updateExercise(ex.localId, 'reps', e.target.value)}
                        style={inputCls} />
                    </div>
                    <div>
                      <label style={labelCls}>Weight / Intensity</label>
                      <input value={ex.weight_guidance} placeholder="RPE 8, bodyweight…"
                        onChange={e => updateExercise(ex.localId, 'weight_guidance', e.target.value)}
                        style={inputCls} />
                    </div>
                    <div>
                      <label style={labelCls}>Rest (sec)</label>
                      <input type="number" min="0" value={ex.rest_seconds}
                        onChange={e => updateExercise(ex.localId, 'rest_seconds', e.target.value)}
                        style={inputCls} />
                    </div>
                    <div>
                      <label style={labelCls}>Notes</label>
                      <input value={ex.notes} placeholder="Cue, form note…"
                        onChange={e => updateExercise(ex.localId, 'notes', e.target.value)}
                        style={inputCls} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addExercise} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)', cursor: 'pointer',
            }}>
              <Plus size={12} /> Add Exercise
            </button>
          </section>

          {/* Nutrition */}
          <section>
            <p style={sectionHead}>Daily Nutrition Targets</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
              {([
                { key: 'calorie_target', label: 'Calories', placeholder: '2200' },
                { key: 'protein_g', label: 'Protein (g)', placeholder: '180' },
                { key: 'carbs_g', label: 'Carbs (g)', placeholder: '220' },
                { key: 'fat_g', label: 'Fat (g)', placeholder: '70' },
              ] as const).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={labelCls}>{label}</label>
                  <input
                    type="number" min="0" placeholder={placeholder}
                    value={nutrition[key]}
                    onChange={e => { setNutrition(prev => ({ ...prev, [key]: e.target.value })); setSavedAt(null); }}
                    style={{ ...inputCls, fontSize: 14, fontWeight: 700 }}
                  />
                </div>
              ))}
            </div>
            <div>
              <label style={labelCls}>Meal Timing Notes</label>
              <input
                value={nutrition.meal_timing_notes}
                placeholder="e.g. Largest meal post-workout, save carbs for evening…"
                onChange={e => { setNutrition(prev => ({ ...prev, meal_timing_notes: e.target.value })); setSavedAt(null); }}
                style={{ ...inputCls, fontSize: 13 }}
              />
            </div>
          </section>
        </>
      )}

      {/* Save bar */}
      {!isRest && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8 }}>
          <button type="button" onClick={handleSave} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: saving ? 'var(--color-surface-elevated)' : '#60a5fa',
            color: saving ? 'var(--color-text-muted)' : '#0a0c0f',
            border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : '0 4px 16px rgba(96,165,250,0.3)',
            transition: 'all 200ms ease',
          }}>
            {saving ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={13} />}
            {saving ? 'Saving…' : 'Save Day'}
          </button>
          {savedAt && (
            <span style={{ fontSize: 12, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={12} />
              Saved {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
