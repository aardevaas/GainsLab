'use client';

import { useState, useEffect, useTransition } from 'react';
import { Plus, Search, X, Loader2, BadgeCheck } from 'lucide-react';
import {
  type FoodItem,
  type MealType,
  MEAL_LABELS,
  MEAL_ORDER,
  calcFoodMacros,
} from '@/lib/nutrition/types';
import { logFood, type LogFoodInput } from './actions';
import { formatNumber } from '@/lib/utils';

type Props = {
  date: string;
};

type AddState = {
  meal: MealType;
  query: string;
  results: FoodItem[];
  searching: boolean;
  selected: FoodItem | null;
  quantity: number;
  unit: 'g' | 'oz' | 'serving';
};

function emptyAdd(meal: MealType): AddState {
  return { meal, query: '', results: [], searching: false, selected: null, quantity: 100, unit: 'g' };
}

export function QuickLogWidget({ date }: Props) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<AddState>(emptyAdd('breakfast'));
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const q = state.query;
    if (!q || q.length < 2 || state.selected || !open) return;

    const id = setTimeout(async () => {
      setState(s => ({ ...s, searching: true }));
      const res = await fetch(`/api/nutrition/search?q=${encodeURIComponent(q)}`);
      const data = await res.json() as { items: FoodItem[] };
      setState(s => ({ ...s, results: data.items, searching: false }));
    }, 350);

    return () => clearTimeout(id);
  }, [state.query, state.selected, open]);

  const preview = state.selected
    ? calcFoodMacros(state.selected.per100g, state.quantity, state.unit, state.selected.servingSize)
    : null;

  function handleSelect(food: FoodItem) {
    setState(s => ({
      ...s,
      selected: food,
      quantity: food.servingSize ? 1 : 100,
      unit: food.servingSize ? 'serving' : 'g',
      results: [],
      query: food.name,
    }));
  }

  function handleAdd() {
    if (!state.selected || !preview) return;

    const input: LogFoodInput = {
      foodId: state.selected.id,
      date,
      mealType: state.meal,
      foodName: state.selected.name,
      brand: state.selected.brand,
      quantity: state.quantity,
      unit: state.unit,
      calories: preview.calories,
      proteinG: preview.proteinG,
      carbsG: preview.carbsG,
      fatG: preview.fatG,
      fiberG: preview.fiberG,
      sodiumMg: preview.sodiumMg,
      sugarG: preview.sugarG,
    };

    startTransition(async () => {
      await logFood(input);
      setOpen(false);
      setState(emptyAdd(state.meal));
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors hover:opacity-80"
        style={{
          background: 'var(--color-surface)',
          border: '1px dashed var(--color-border)',
          color: 'var(--color-accent)',
        }}
      >
        <Plus size={15} /> Quick add food
      </button>
    );
  }

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,128,0,0.35)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Quick add food</p>
        <button
          onClick={() => setOpen(false)}
          className="size-6 flex items-center justify-center rounded"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Meal type tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {MEAL_ORDER.map(meal => (
          <button
            key={meal}
            onClick={() => setState(s => ({ ...s, meal }))}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{
              background: state.meal === meal ? 'var(--color-accent)' : 'var(--color-surface-elevated)',
              color: state.meal === meal ? '#0a0c0f' : 'var(--color-text-secondary)',
            }}
          >
            {MEAL_LABELS[meal]}
          </button>
        ))}
      </div>

      {/* Search / selected food */}
      {!state.selected ? (
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            autoFocus
            type="text"
            placeholder="Search foods..."
            value={state.query}
            onChange={e => setState(s => ({ ...s, query: e.target.value, results: [] }))}
            className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none focus:border-[var(--color-accent)]"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
          {state.searching && (
            <Loader2
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
              style={{ color: 'var(--color-text-muted)' }}
            />
          )}
        </div>
      ) : (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-accent)', color: 'var(--color-text)' }}
        >
          <span className="flex-1 truncate">{state.selected.name}</span>
          <button
            onClick={() => setState(s => ({ ...s, selected: null, query: '', results: [] }))}
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Search results */}
      {state.results.length > 0 && !state.selected && (
        <div
          className="rounded-lg border divide-y overflow-hidden max-h-48 overflow-y-auto"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
        >
          {state.results.map(item => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-surface)]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="truncate font-medium" style={{ color: 'var(--color-text)' }}>{item.name}</p>
                  {item.verified && (
                    <span
                      className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
                    >
                      <BadgeCheck size={10} /> Verified
                    </span>
                  )}
                </div>
                {item.brand && (
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{item.brand}</p>
                )}
              </div>
              <span className="shrink-0 text-xs ml-4" style={{ color: 'var(--color-text-secondary)' }}>
                {item.per100g.calories} kcal/100g
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Quantity + submit */}
      {state.selected && preview && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              step={state.unit === 'g' ? 10 : 1}
              value={state.quantity}
              onChange={e => setState(s => ({ ...s, quantity: Number(e.target.value) }))}
              className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus:border-[var(--color-accent)]"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
            <select
              value={state.unit}
              onChange={e => setState(s => ({ ...s, unit: e.target.value as 'g' | 'oz' | 'serving' }))}
              className="px-3 py-2 rounded-lg border text-sm outline-none"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option value="g">g</option>
              <option value="oz">oz</option>
              {state.selected.servingSize && (
                <option value="serving">
                  serving ({state.selected.servingSize}{state.selected.servingUnit})
                </option>
              )}
            </select>
          </div>

          <div
            className="flex items-center gap-3 flex-wrap px-3 py-2 rounded-lg text-xs"
            style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)' }}
          >
            <span className="font-bold" style={{ color: 'var(--color-accent)' }}>
              {formatNumber(preview.calories)} kcal
            </span>
            <span style={{ color: '#4ade80' }}>{formatNumber(preview.proteinG, 1)}P</span>
            <span style={{ color: '#60a5fa' }}>{formatNumber(preview.carbsG, 1)}C</span>
            <span style={{ color: '#fbbf24' }}>{formatNumber(preview.fatG, 1)}F</span>
            {preview.fiberG > 0 && (
              <span style={{ color: 'var(--color-text-secondary)' }}>{formatNumber(preview.fiberG, 1)}g fiber</span>
            )}
            {preview.sodiumMg > 0 && (
              <span style={{ color: 'var(--color-text-secondary)' }}>{formatNumber(preview.sodiumMg, 0)}mg Na</span>
            )}
            {preview.sugarG > 0 && (
              <span style={{ color: 'var(--color-text-secondary)' }}>{formatNumber(preview.sugarG, 1)}g sugar</span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60"
            style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add to {MEAL_LABELS[state.meal]}
          </button>
        </div>
      )}

      {!state.selected && (
        <button
          onClick={() => setOpen(false)}
          className="text-xs"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
