'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X } from 'lucide-react';
import {
  MUSCLE_OPTIONS,
  EQUIPMENT_OPTIONS,
  CATEGORY_OPTIONS,
  LEVEL_OPTIONS,
  LEVEL_COLORS,
  type ExerciseLevel,
} from '@/lib/exercises/types';

type Filters = {
  q?: string;
  muscle?: string;
  equipment?: string;
  category?: string;
  level?: string;
};

/** Instant filter sidebar — pushes URL on every change, no submit button. */
export function ExerciseFilters({ q, muscle, equipment, category, level }: Filters) {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>({ q, muscle, equipment, category, level });
  const [searching, setSearching] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function push(f: Filters) {
    const p = new URLSearchParams();
    if (f.q) p.set('q', f.q);
    if (f.muscle) p.set('muscle', f.muscle);
    if (f.equipment) p.set('equipment', f.equipment);
    if (f.category) p.set('category', f.category);
    if (f.level) p.set('level', f.level);
    router.push(p.toString() ? `/exercises?${p}` : '/exercises');
  }

  function handleQ(value: string) {
    const next = { ...filters, q: value || undefined };
    setFilters(next);
    clearTimeout(debounce.current);
    if (!value) {
      push(next);
      return;
    }
    setSearching(true);
    debounce.current = setTimeout(() => {
      push(next);
      setSearching(false);
    }, 300);
  }

  function toggle(name: keyof Filters, value: string) {
    const next = { ...filters, [name]: filters[name] === value ? undefined : value };
    setFilters(next);
    push(next);
  }

  const hasFilters = !!(filters.q || filters.muscle || filters.equipment || filters.category || filters.level);

  return (
    <div className="space-y-5">
      {/* Search with clear button */}
      <div className="relative">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--color-text-muted)' }}
        />
        <input
          type="text"
          value={filters.q ?? ''}
          onChange={e => handleQ(e.target.value)}
          placeholder="Search exercises..."
          className="w-full pl-8 pr-8 py-2 rounded-lg border text-sm outline-none focus:border-[var(--color-accent)]"
          style={{
            background: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
        {searching ? (
          <Loader2
            size={12}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
            style={{ color: 'var(--color-text-muted)' }}
          />
        ) : filters.q ? (
          <button
            type="button"
            onClick={() => handleQ('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        ) : null}
      </div>

      <FilterGroup
        title="Muscle"
        options={MUSCLE_OPTIONS}
        value={filters.muscle}
        onSelect={v => toggle('muscle', v)}
      />
      <FilterGroup
        title="Equipment"
        options={EQUIPMENT_OPTIONS}
        value={filters.equipment}
        onSelect={v => toggle('equipment', v)}
      />
      <FilterGroup
        title="Category"
        options={CATEGORY_OPTIONS}
        value={filters.category}
        onSelect={v => toggle('category', v)}
      />

      {/* Level — colored dots */}
      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-wide mb-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Level
        </p>
        {LEVEL_OPTIONS.map(opt => {
          const color = LEVEL_COLORS[opt as ExerciseLevel];
          const active = filters.level === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle('level', opt)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs capitalize transition-colors text-left"
              style={{
                background: active ? `${color}18` : 'transparent',
                color: active ? color : 'var(--color-text-secondary)',
                fontWeight: active ? 600 : 400,
              }}
            >
              <span className="size-1.5 rounded-full shrink-0" style={{ background: color }} />
              {opt}
            </button>
          );
        })}
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setFilters({});
            router.push('/exercises');
          }}
          className="w-full py-2 rounded-lg text-xs border transition-colors"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          Clear all
        </button>
      )}
    </div>
  );
}

function FilterGroup({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: readonly string[];
  value?: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <p
        className="text-[11px] font-semibold uppercase tracking-wide mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {title}
      </p>
      {options.map(opt => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs capitalize transition-colors text-left"
            style={{
              background: active ? 'var(--color-accent-subtle)' : 'transparent',
              color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontWeight: active ? 600 : 400,
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
