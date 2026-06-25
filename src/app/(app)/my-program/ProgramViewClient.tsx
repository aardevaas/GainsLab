'use client';

import { useState, useEffect, useOptimistic, useTransition } from 'react';
import { ChevronDown, ChevronRight, Moon, Dumbbell, Clock, RotateCcw, StickyNote, CheckCircle2, Circle } from 'lucide-react';
import { loadMemberDayContent, markDayComplete, unmarkDayComplete } from './actions';

type Exercise = {
  exercise_name: string;
  sets: number | null;
  reps: string | null;
  weight_guidance: string | null;
  rest_seconds: number | null;
  notes: string | null;
  order_index: number;
};

type Nutrition = {
  calorie_target: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  meal_timing_notes: string | null;
};

type Day = { id: string; day_number: number; title: string | null; rest_day: boolean };
type Week = { id: string; week_number: number; title: string | null; days: Day[] };

type Program = {
  id: string;
  title: string;
  type: string;
  goal: string | null;
  duration_weeks: number;
};

type Creator = { display_name: string; slug: string } | null;

type Props = {
  roster: { id: string; startDate: string };
  program: Program;
  creator: Creator;
  weeks: Week[];
  initialCompletedDayIds: string[];
};

const TYPE_COLOR: Record<string, string> = {
  challenge: '#fbbf24',
  one_on_one: '#60a5fa',
  standard: '#4ade80',
};

const TYPE_LABEL: Record<string, string> = {
  challenge: 'Challenge',
  one_on_one: '1-on-1',
  standard: 'Program',
};

const GOAL_LABEL: Record<string, string> = {
  fat_loss: 'Fat Loss',
  muscle_gain: 'Muscle Gain',
  maintenance: 'Maintenance',
  performance: 'Performance',
  general: 'General Fitness',
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function computeCurrentDayId(startDate: string, weeks: Week[]): string | null {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSince = Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
  const allDays = weeks.flatMap(w => w.days);
  const idx = Math.min(daysSince, allDays.length - 1);
  return allDays[idx]?.id ?? null;
}

export function ProgramViewClient({ roster, program, creator, weeks, initialCompletedDayIds }: Props) {
  const allDays = weeks.flatMap(w => w.days);
  const totalDays = allDays.length;

  const currentDayId = computeCurrentDayId(roster.startDate, weeks);

  const [selectedDayId, setSelectedDayId] = useState<string | null>(currentDayId);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(() => {
    const currentWeek = weeks.find(w => w.days.some(d => d.id === currentDayId));
    return new Set(currentWeek ? [currentWeek.id] : weeks.slice(0, 1).map(w => w.id));
  });
  const [dayContent, setDayContent] = useState<{ exercises: Exercise[]; nutrition: Nutrition | null } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [completedIds, setOptimisticCompleted] = useOptimistic(
    new Set<string>(initialCompletedDayIds),
    (prev, action: { type: 'add' | 'remove'; dayId: string }) => {
      const next = new Set(prev);
      action.type === 'add' ? next.add(action.dayId) : next.delete(action.dayId);
      return next;
    }
  );

  const [isPending, startTransition] = useTransition();

  function toggleComplete(dayId: string) {
    const alreadyDone = completedIds.has(dayId);
    startTransition(async () => {
      setOptimisticCompleted({ type: alreadyDone ? 'remove' : 'add', dayId });
      if (alreadyDone) {
        await unmarkDayComplete(dayId);
      } else {
        await markDayComplete(dayId);
      }
    });
  }

  useEffect(() => {
    if (!selectedDayId) return;
    let cancelled = false;
    setIsLoading(true);
    setDayContent(null);
    loadMemberDayContent(selectedDayId).then(data => {
      if (!cancelled) {
        setDayContent(data);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [selectedDayId]);

  const selectedDay = allDays.find(d => d.id === selectedDayId);
  const selectedWeek = weeks.find(w => w.days.some(d => d.id === selectedDayId));

  const completedCount = completedIds.size;
  const progressPct = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  const typeColor = TYPE_COLOR[program.type] ?? '#60a5fa';

  function toggleWeek(weekId: string) {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      next.has(weekId) ? next.delete(weekId) : next.add(weekId);
      return next;
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Program header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-secondary)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                color: typeColor, background: `${typeColor}14`, padding: '2px 8px', borderRadius: 5,
                fontFamily: 'var(--font-mono)', flexShrink: 0,
              }}>
                {TYPE_LABEL[program.type]}
              </span>
              {program.goal && (
                <span style={{
                  fontSize: 10, color: 'var(--color-text-muted)',
                  background: 'var(--color-surface-elevated)', padding: '2px 8px', borderRadius: 5,
                  fontFamily: 'var(--font-mono)',
                }}>
                  {GOAL_LABEL[program.goal]}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.02em' }}>
              {program.title}
            </h1>
            {creator && (
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                by {creator.display_name}
              </p>
            )}
          </div>

          {/* Completion counter */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontSize: 20, fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.04em', margin: 0 }}>
              {completedCount}
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)' }}>
                /{totalDays}
              </span>
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '1px 0 0' }}>
              days completed
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, borderRadius: 2, background: 'var(--color-border)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${progressPct}%`,
            background: `linear-gradient(90deg, ${typeColor}99, ${typeColor})`,
            transition: 'width 400ms ease',
          }} />
        </div>
        <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '4px 0 0', fontFamily: 'var(--font-mono)' }}>
          {progressPct}% complete
        </p>
      </div>

      {/* Editor body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left: week/day tree */}
        <div style={{
          width: 210, flexShrink: 0,
          borderRight: '1px solid var(--color-border-subtle)',
          overflowY: 'auto',
          background: 'var(--color-bg-secondary)',
          padding: '10px 0',
        }}>
          {weeks.map(week => {
            const expanded = expandedWeeks.has(week.id);
            const weekCompleted = week.days.length > 0 && week.days.every(d => completedIds.has(d.id));
            return (
              <div key={week.id}>
                <button type="button" onClick={() => toggleWeek(week.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left',
                }}>
                  {expanded
                    ? <ChevronDown size={11} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    : <ChevronRight size={11} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />}
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: weekCompleted ? '#4ade80' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-mono)', flex: 1,
                  }}>
                    {week.title ?? `Week ${week.week_number}`}
                  </span>
                  {weekCompleted && <CheckCircle2 size={10} style={{ color: '#4ade80', flexShrink: 0 }} />}
                </button>

                {expanded && week.days.map(day => {
                  const isSelected = selectedDayId === day.id;
                  const isCurrent = day.id === currentDayId;
                  const isDone = completedIds.has(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setSelectedDayId(day.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 7,
                        padding: '6px 12px 6px 26px',
                        background: isSelected ? 'rgba(96,165,250,0.08)' : 'transparent',
                        border: 'none', cursor: 'pointer', textAlign: 'left',
                        borderLeft: isSelected ? '2px solid #60a5fa' : '2px solid transparent',
                        transition: 'all 100ms ease',
                      }}
                    >
                      <div style={{
                        width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                        background: isDone ? '#4ade80' : day.rest_day ? '#fbbf24' : isSelected ? '#60a5fa' : 'var(--color-border)',
                      }} />
                      <span style={{
                        fontSize: 12,
                        fontWeight: isSelected ? 700 : 500,
                        color: isDone ? '#4ade80' : isSelected ? '#60a5fa' : day.rest_day ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        textDecoration: isDone ? 'line-through' : 'none',
                        textDecorationColor: 'rgba(74,222,128,0.4)',
                      }}>
                        {day.title ?? DAY_LABELS[day.day_number - 1] ?? `Day ${day.day_number}`}
                      </span>
                      {isCurrent && !isSelected && !isDone && (
                        <span style={{
                          fontSize: 8, fontWeight: 800, color: typeColor,
                          background: `${typeColor}18`, padding: '1px 5px', borderRadius: 3,
                          fontFamily: 'var(--font-mono)', textTransform: 'uppercase', flexShrink: 0,
                        }}>
                          Today
                        </span>
                      )}
                      {isDone && <CheckCircle2 size={10} style={{ color: '#4ade80', flexShrink: 0 }} />}
                      {!isDone && day.rest_day && <Moon size={9} style={{ color: '#fbbf24', flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Right: day viewer */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {!selectedDay ? (
            <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
              Select a day from the left panel.
            </div>
          ) : selectedDay.rest_day ? (
            <RestDayView
              dayId={selectedDay.id}
              dayLabel={selectedDay.title ?? DAY_LABELS[selectedDay.day_number - 1] ?? `Day ${selectedDay.day_number}`}
              weekNumber={selectedWeek?.week_number ?? 1}
              isCurrent={selectedDay.id === currentDayId}
              isDone={completedIds.has(selectedDay.id)}
              isPending={isPending}
              onToggle={() => toggleComplete(selectedDay.id)}
            />
          ) : (
            <TrainingDayView
              dayId={selectedDay.id}
              dayLabel={selectedDay.title ?? DAY_LABELS[selectedDay.day_number - 1] ?? `Day ${selectedDay.day_number}`}
              weekNumber={selectedWeek?.week_number ?? 1}
              isCurrent={selectedDay.id === currentDayId}
              isDone={completedIds.has(selectedDay.id)}
              isPending={isPending}
              onToggle={() => toggleComplete(selectedDay.id)}
              isLoading={isLoading}
              exercises={dayContent?.exercises ?? []}
              nutrition={dayContent?.nutrition ?? null}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CompletionButton({ isDone, isPending, onToggle }: { isDone: boolean; isPending: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isPending}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '9px 18px', borderRadius: 10, cursor: isPending ? 'not-allowed' : 'pointer',
        background: isDone ? 'rgba(74,222,128,0.1)' : 'rgba(74,222,128,0.06)',
        border: `1px solid ${isDone ? 'rgba(74,222,128,0.3)' : 'rgba(74,222,128,0.15)'}`,
        color: isDone ? '#4ade80' : 'var(--color-text-muted)',
        fontSize: 13, fontWeight: 700,
        transition: 'all 150ms ease',
        opacity: isPending ? 0.6 : 1,
      } as React.CSSProperties}
    >
      {isDone
        ? <><CheckCircle2 size={15} style={{ color: '#4ade80' }} /> Completed</>
        : <><Circle size={15} /> Mark complete</>}
    </button>
  );
}

function RestDayView({ dayId, dayLabel, weekNumber, isCurrent, isDone, isPending, onToggle }: {
  dayId: string; dayLabel: string; weekNumber: number; isCurrent: boolean;
  isDone: boolean; isPending: boolean; onToggle: () => void;
}) {
  void dayId;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 16, textAlign: 'center' }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Moon size={28} style={{ color: '#fbbf24' }} />
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fbbf24', margin: '0 0 6px', fontFamily: 'var(--font-mono)' }}>
          Week {weekNumber} · {dayLabel}
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-text)', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
          Recovery Day
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 20px', maxWidth: 340, lineHeight: 1.6 }}>
          {isCurrent
            ? 'Today is a rest day. Focus on sleep, hydration, and light movement. Your body grows stronger when it recovers.'
            : 'No training scheduled. Recovery is part of the program.'}
        </p>
        <CompletionButton isDone={isDone} isPending={isPending} onToggle={onToggle} />
      </div>
    </div>
  );
}

function TrainingDayView({ dayId, dayLabel, weekNumber, isCurrent, isDone, isPending, onToggle, isLoading, exercises, nutrition }: {
  dayId: string; dayLabel: string; weekNumber: number; isCurrent: boolean;
  isDone: boolean; isPending: boolean; onToggle: () => void;
  isLoading: boolean; exercises: Exercise[]; nutrition: Nutrition | null;
}) {
  void dayId;
  return (
    <div style={{ maxWidth: 680 }}>
      {/* Day header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', margin: 0, fontFamily: 'var(--font-mono)' }}>
              Week {weekNumber} · {dayLabel}
            </p>
            {isCurrent && (
              <span style={{
                fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                color: '#4ade80', background: 'rgba(74,222,128,0.12)', padding: '2px 7px', borderRadius: 4,
                fontFamily: 'var(--font-mono)',
              }}>
                Today
              </span>
            )}
          </div>
          <CompletionButton isDone={isDone} isPending={isPending} onToggle={onToggle} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.03em' }}>
          Training Day
        </h2>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 72, borderRadius: 12,
              background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
              opacity: 0.5,
            }} />
          ))}
        </div>
      ) : (
        <>
          {/* Exercises */}
          {exercises.length === 0 ? (
            <div style={{
              padding: '32px 24px', borderRadius: 14, border: '1px dashed var(--color-border)',
              textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13,
            }}>
              No exercises have been added for this day yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {exercises.map((ex, i) => (
                <ExerciseCard key={i} exercise={ex} index={i} />
              ))}
            </div>
          )}

          {/* Nutrition targets */}
          {nutrition && (
            <div style={{
              borderRadius: 14, border: '1px solid var(--color-border-subtle)',
              background: 'var(--color-surface)', overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', margin: 0, fontFamily: 'var(--font-mono)' }}>
                  Daily Nutrition Targets
                </p>
              </div>
              <div style={{ padding: '14px 18px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <NutrStat label="Calories" value={nutrition.calorie_target} unit="kcal" color="#60a5fa" />
                <NutrStat label="Protein" value={nutrition.protein_g} unit="g" color="#4ade80" />
                <NutrStat label="Carbs" value={nutrition.carbs_g} unit="g" color="#fbbf24" />
                <NutrStat label="Fat" value={nutrition.fat_g} unit="g" color="#f87171" />
              </div>
              {nutrition.meal_timing_notes && (
                <div style={{ padding: '0 18px 14px' }}>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
                    {nutrition.meal_timing_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  return (
    <div style={{
      borderRadius: 12, border: '1px solid var(--color-border-subtle)',
      background: 'var(--color-surface)', padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Index badge */}
        <div style={{
          width: 26, height: 26, borderRadius: 8, background: 'var(--color-surface-elevated)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-mono)', flexShrink: 0,
        }}>
          {index + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 8px' }}>
            {exercise.exercise_name}
          </p>

          {/* Metric chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {exercise.sets != null && (
              <Chip icon={<Dumbbell size={10} />} text={`${exercise.sets} sets`} />
            )}
            {exercise.reps && (
              <Chip icon={<RotateCcw size={10} />} text={exercise.reps} />
            )}
            {exercise.weight_guidance && (
              <Chip icon={<span style={{ fontSize: 9, fontWeight: 800 }}>kg</span>} text={exercise.weight_guidance} />
            )}
            {exercise.rest_seconds != null && (
              <Chip icon={<Clock size={10} />} text={`${exercise.rest_seconds}s rest`} />
            )}
          </div>

          {exercise.notes && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 8 }}>
              <StickyNote size={11} style={{ color: 'var(--color-text-muted)', marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                {exercise.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 6,
      background: 'var(--color-surface-elevated)',
      fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)',
      fontFamily: 'var(--font-mono)',
    }}>
      {icon}
      {text}
    </span>
  );
}

function NutrStat({ label, value, unit, color }: { label: string; value: number | null; unit: string; color: string }) {
  return (
    <div style={{ minWidth: 80 }}>
      <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', margin: '0 0 2px' }}>
        {label}
      </p>
      <p style={{ fontSize: 20, fontWeight: 900, color, letterSpacing: '-0.04em', margin: 0 }}>
        {value ?? '—'}
      </p>
      {value != null && (
        <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: 0 }}>{unit}</p>
      )}
    </div>
  );
}
