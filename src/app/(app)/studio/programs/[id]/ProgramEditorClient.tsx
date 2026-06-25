'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, EyeOff, ChevronDown, ChevronRight, Moon } from 'lucide-react';
import { toggleProgramPublish } from './actions';
import { DayEditorClient } from './DayEditorClient';

type Day = { id: string; day_number: number; title: string | null; rest_day: boolean };
type Week = { id: string; week_number: number; title: string | null; days: Day[] };

type Program = {
  id: string;
  title: string;
  type: string;
  goal: string | null;
  duration_weeks: number;
  price_bob: number;
  is_free: boolean;
  is_published: boolean;
};

type Props = { program: Program; weeks: Week[] };

const TYPE_COLOR: Record<string, string> = {
  challenge: '#fbbf24', one_on_one: '#60a5fa', standard: '#4ade80',
};

const TYPE_LABEL: Record<string, string> = {
  challenge: 'Challenge', one_on_one: '1-on-1', standard: 'Program',
};

export function ProgramEditorClient({ program, weeks }: Props) {
  const firstTrainingDay = weeks.flatMap(w => w.days).find(d => !d.rest_day) ?? weeks[0]?.days[0];
  const [selectedDayId, setSelectedDayId] = useState<string | null>(firstTrainingDay?.id ?? null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set(weeks.map(w => w.id)));
  const [localIsPublished, setLocalIsPublished] = useState(program.is_published);
  const [isPending, startTransition] = useTransition();
  const [localRestMap, setLocalRestMap] = useState<Record<string, boolean>>(
    Object.fromEntries(weeks.flatMap(w => w.days).map(d => [d.id, d.rest_day])),
  );

  const selectedDay = weeks.flatMap(w => w.days.map(d => ({ ...d, weekNumber: w.week_number }))).find(d => d.id === selectedDayId);

  function toggleWeek(weekId: string) {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      next.has(weekId) ? next.delete(weekId) : next.add(weekId);
      return next;
    });
  }

  function handlePublishToggle() {
    const next = !localIsPublished;
    setLocalIsPublished(next);
    startTransition(async () => {
      await toggleProgramPublish(program.id, !next);
    });
  }

  function handleRestToggled(dayId: string, isRest: boolean) {
    setLocalRestMap(prev => ({ ...prev, [dayId]: isRest }));
  }

  const typeColor = TYPE_COLOR[program.type] ?? '#60a5fa';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Program header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px',
        borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-secondary)',
        flexShrink: 0,
      }}>
        <Link href="/studio/programs" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 30, height: 30, borderRadius: 8, border: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <ArrowLeft size={13} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>

        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: typeColor, background: `${typeColor}14`, padding: '3px 8px', borderRadius: 5,
          fontFamily: 'var(--font-mono)', flexShrink: 0,
        }}>
          {TYPE_LABEL[program.type]}
        </span>

        <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {program.title}
        </h1>

        <span style={{ fontSize: 12, color: 'var(--color-text-muted)', flexShrink: 0 }}>
          {program.duration_weeks}w · {program.is_free ? 'Free' : `Bs. ${program.price_bob}`}
        </span>

        <button
          type="button"
          onClick={handlePublishToggle}
          disabled={isPending}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
            fontSize: 12, fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer',
            border: localIsPublished ? '1px solid rgba(74,222,128,0.4)' : '1px solid var(--color-border)',
            background: localIsPublished ? 'rgba(74,222,128,0.08)' : 'var(--color-surface-elevated)',
            color: localIsPublished ? '#4ade80' : 'var(--color-text-secondary)',
            transition: 'all 150ms ease', flexShrink: 0,
          }}
        >
          {localIsPublished ? <Globe size={12} /> : <EyeOff size={12} />}
          {localIsPublished ? 'Published' : 'Publish'}
        </button>
      </div>

      {/* Editor body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left: week/day tree */}
        <div style={{
          width: 230, flexShrink: 0, borderRight: '1px solid var(--color-border-subtle)',
          overflowY: 'auto', background: 'var(--color-bg-secondary)', padding: '12px 0',
        }}>
          {weeks.map(week => {
            const expanded = expandedWeeks.has(week.id);
            return (
              <div key={week.id}>
                {/* Week header */}
                <button type="button" onClick={() => toggleWeek(week.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left',
                }}>
                  {expanded
                    ? <ChevronDown size={11} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    : <ChevronRight size={11} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  }
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {week.title ?? `Week ${week.week_number}`}
                  </span>
                </button>

                {/* Days */}
                {expanded && week.days.map(day => {
                  const isSelected = selectedDayId === day.id;
                  const isRest = localRestMap[day.id] ?? day.rest_day;
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setSelectedDayId(day.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 14px 7px 30px',
                        background: isSelected ? 'rgba(96,165,250,0.08)' : 'transparent',
                        border: 'none', cursor: 'pointer', textAlign: 'left',
                        borderLeft: isSelected ? '2px solid #60a5fa' : '2px solid transparent',
                        transition: 'all 100ms ease',
                      }}
                    >
                      <div style={{
                        width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                        background: isRest ? '#fbbf24' : isSelected ? '#60a5fa' : 'var(--color-border)',
                      }} />
                      <span style={{
                        fontSize: 12, fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#60a5fa' : isRest ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {day.title ?? `Day ${day.day_number}`}
                      </span>
                      {isRest && <Moon size={10} style={{ color: '#fbbf24', flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Right: day editor */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {selectedDay ? (
            <DayEditorClient
              key={selectedDay.id}
              dayId={selectedDay.id}
              dayNumber={selectedDay.day_number}
              weekNumber={selectedDay.weekNumber}
              initialTitle={selectedDay.title}
              initialIsRest={localRestMap[selectedDay.id] ?? selectedDay.rest_day}
              onRestToggled={handleRestToggled}
            />
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: 300, gap: 10, color: 'var(--color-text-muted)',
            }}>
              <p style={{ fontSize: 14 }}>Select a day from the left panel to start editing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
