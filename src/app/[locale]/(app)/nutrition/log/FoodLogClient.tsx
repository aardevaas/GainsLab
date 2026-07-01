'use client';

import { useState, useEffect, useTransition, useOptimistic } from 'react';
import { Plus, X, Search, ChevronRight, Loader2, Trash2, BadgeCheck } from 'lucide-react';
import {
  type FoodItem,
  type FoodLogEntry,
  type MealType,
  type DayMacros,
  MEAL_LABELS,
  MEAL_ORDER,
  sumMacros,
  calcFoodMacros,
} from '@/lib/nutrition/types';
import { logFood, deleteLogEntry, type LogFoodInput } from '../actions';
import { formatNumber } from '@/lib/utils';

type Props = {
  date: string;
  entries: FoodLogEntry[];
  goals: { calories: number; proteinG: number; carbsG: number; fatG: number };
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

const EMPTY_ADD: AddState = {
  meal: 'breakfast',
  query: '',
  results: [],
  searching: false,
  selected: null,
  quantity: 100,
  unit: 'g',
};

export function FoodLogClient({ date, entries: initial, goals }: Props) {
  const [entries, setOptimisticEntries] = useOptimistic(
    initial,
    (state, id: string) => state.filter(e => e.id !== id),
  );

  const [addState, setAddState] = useState<AddState | null>(null);
  const [addPending, startAdd] = useTransition();
  const [deletePending, startDelete] = useTransition();

  // Debounced food search
  useEffect(() => {
    if (!addState?.query || addState.query.length < 2 || addState.selected) return;

    const id = setTimeout(async () => {
      setAddState(s => s && { ...s, searching: true });
      const res = await fetch(`/api/nutrition/search?q=${encodeURIComponent(addState.query)}`);
      const data = await res.json() as { items: FoodItem[] };
      setAddState(s => s && { ...s, results: data.items, searching: false });
    }, 350);

    return () => clearTimeout(id);
  }, [addState?.query, addState?.selected]);

  const totals = sumMacros(entries);

  function openAdd(meal: MealType) {
    setAddState({ ...EMPTY_ADD, meal });
  }

  function closeAdd() {
    setAddState(null);
  }

  function handleSelect(food: FoodItem) {
    // `servingSize` is the size of ONE serving (e.g. 30g) — not a count. Default
    // to 1 serving when known (calcFoodMacros multiplies by the gram size), else
    // 100g. Previously quantity defaulted to the serving SIZE with unit
    // "serving" (e.g. "30 servings" → 900g → ~4,200 kcal).
    setAddState(s => s && {
      ...s,
      selected: food,
      quantity: food.servingSize ? 1 : 100,
      unit: food.servingSize ? 'serving' : 'g',
      results: [],
      query: food.name,
    });
  }

  const preview = addState?.selected
    ? calcFoodMacros(
        addState.selected.per100g,
        addState.quantity,
        addState.unit,
        addState.selected.servingSize,
      )
    : null;

  function handleAdd() {
    if (!addState?.selected || !preview) return;

    const input: LogFoodInput = {
      foodId: addState.selected.id,
      date,
      mealType: addState.meal,
      foodName: addState.selected.name,
      brand: addState.selected.brand,
      quantity: addState.quantity,
      unit: addState.unit,
      calories: preview.calories,
      proteinG: preview.proteinG,
      carbsG: preview.carbsG,
      fatG: preview.fatG,
      fiberG: preview.fiberG,
      sodiumMg: preview.sodiumMg,
      sugarG: preview.sugarG,
    };

    startAdd(async () => {
      await logFood(input);
      setAddState(null);
    });
  }

  function handleDelete(id: string) {
    startDelete(async () => {
      setOptimisticEntries(id);
      await deleteLogEntry(id);
    });
  }

  const pct = (v: number, goal: number) => Math.min(100, Math.round((v / goal) * 100));

  return (
    <div className="space-y-2">
      {/* Day totals bar */}
      <div
        className="rounded-xl border p-5 mb-6"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Today</p>
            <p
              className="text-3xl font-bold"
              style={{ color: 'var(--color-accent)', letterSpacing: '-0.03em' }}
            >
              {formatNumber(totals.calories)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              / {formatNumber(goals.calories)} kcal goal · {pct(totals.calories, goals.calories)}%
            </p>
          </div>
          <div className="flex gap-4 text-right text-xs">
            <div>
              <p className="font-semibold" style={{ color: '#4ade80' }}>{formatNumber(totals.proteinG, 1)}g</p>
              <p style={{ color: 'var(--color-text-muted)' }}>protein</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#60a5fa' }}>{formatNumber(totals.carbsG, 1)}g</p>
              <p style={{ color: 'var(--color-text-muted)' }}>carbs</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#fbbf24' }}>{formatNumber(totals.fatG, 1)}g</p>
              <p style={{ color: 'var(--color-text-muted)' }}>fat</p>
            </div>
          </div>
        </div>
        <MacroProgressBar label="Protein" value={totals.proteinG} goal={goals.proteinG} color="#4ade80" />
        <MacroProgressBar label="Carbs" value={totals.carbsG} goal={goals.carbsG} color="#60a5fa" />
        <MacroProgressBar label="Fat" value={totals.fatG} goal={goals.fatG} color="#fbbf24" />
        {(totals.fiberG > 0 || totals.sodiumMg > 0 || totals.sugarG > 0) && (
          <div className="flex gap-4 mt-3 flex-wrap text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {totals.fiberG > 0 && <span>Fiber {formatNumber(totals.fiberG, 1)}g</span>}
            {totals.sodiumMg > 0 && <span>Sodium {formatNumber(totals.sodiumMg, 0)}mg</span>}
            {totals.sugarG > 0 && <span>Sugar {formatNumber(totals.sugarG, 1)}g</span>}
          </div>
        )}
      </div>

      {/* Meal sections */}
      {MEAL_ORDER.map(meal => {
        const mealEntries = entries.filter(e => e.meal_type === meal);
        const mealTotals = sumMacros(mealEntries);
        const isAdding = addState?.meal === meal;

        return (
          <section
            key={meal}
            className="rounded-xl border overflow-hidden"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {/* Meal header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                  {MEAL_LABELS[meal]}
                </h3>
                {mealEntries.length > 0 && (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {formatNumber(mealTotals.calories)} kcal ·{' '}
                    {formatNumber(mealTotals.proteinG, 1)}P {formatNumber(mealTotals.carbsG, 1)}C {formatNumber(mealTotals.fatG, 1)}F
                  </span>
                )}
              </div>
              {!isAdding && (
                <button
                  onClick={() => openAdd(meal)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
                >
                  <Plus size={12} /> Add
                </button>
              )}
            </div>

            {/* Entries */}
            {mealEntries.map(entry => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-5 py-3 border-b"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: 'var(--color-text)' }}>
                    {entry.food_name}
                  </p>
                  {entry.brand && (
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{entry.brand}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs shrink-0">
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {entry.quantity} {entry.unit}
                  </span>
                  <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                    {formatNumber(entry.calories)} kcal
                  </span>
                  <span style={{ color: '#4ade80' }}>{formatNumber(entry.protein_g, 1)}P</span>
                  <span style={{ color: '#60a5fa' }}>{formatNumber(entry.carbs_g, 1)}C</span>
                  <span style={{ color: '#fbbf24' }}>{formatNumber(entry.fat_g, 1)}F</span>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={deletePending}
                  className="shrink-0 size-7 flex items-center justify-center rounded-lg transition-colors hover:bg-red-500/10"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {mealEntries.length === 0 && !isAdding && (
              <div className="px-5 py-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Nothing logged yet
              </div>
            )}

            {/* Add food panel */}
            {isAdding && (
              <div className="p-4 space-y-3" style={{ background: 'var(--color-surface-elevated)' }}>
                {/* Search */}
                {!addState.selected ? (
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search foods..."
                      value={addState.query}
                      onChange={e => setAddState(s => s && { ...s, query: e.target.value, results: [] })}
                      className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none focus:border-[var(--color-accent)]"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                    {addState.searching && (
                      <Loader2
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
                        style={{ color: 'var(--color-text-muted)' }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
                      style={{ background: 'var(--color-bg)', borderColor: 'var(--color-accent)', color: 'var(--color-text)' }}
                    >
                      <span className="flex-1 truncate">{addState.selected.name}</span>
                      <button
                        onClick={() => setAddState(s => s && { ...s, selected: null, query: '', results: [] })}
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Search results */}
                {addState.results.length > 0 && !addState.selected && (
                  <div
                    className="rounded-lg border divide-y overflow-hidden"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
                  >
                    {addState.results.map(item => (
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
                                title="Lab-verified data (USDA)"
                              >
                                <BadgeCheck size={10} /> Verified
                              </span>
                            )}
                          </div>
                          {item.brand && (
                            <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{item.brand}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-4 text-xs">
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            {item.per100g.calories} kcal/100g
                          </span>
                          <ChevronRight size={12} style={{ color: 'var(--color-text-muted)' }} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Quantity picker */}
                {addState.selected && preview && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        step={addState.unit === 'g' ? 10 : 1}
                        value={addState.quantity}
                        onChange={e => setAddState(s => s && { ...s, quantity: Number(e.target.value) })}
                        className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus:border-[var(--color-accent)]"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                      <select
                        value={addState.unit}
                        onChange={e => setAddState(s => s && { ...s, unit: e.target.value as 'g' | 'oz' | 'serving' })}
                        className="px-3 py-2 rounded-lg border text-sm outline-none"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      >
                        <option value="g">g</option>
                        <option value="oz">oz</option>
                        {addState.selected.servingSize && (
                          <option value="serving">
                            serving ({addState.selected.servingSize}{addState.selected.servingUnit})
                          </option>
                        )}
                      </select>
                    </div>

                    {/* Macro preview */}
                    <div
                      className="flex items-center gap-3 flex-wrap px-4 py-2.5 rounded-lg text-xs"
                      style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border-subtle)' }}
                    >
                      <span className="font-bold" style={{ color: 'var(--color-accent)' }}>
                        {formatNumber(preview.calories)} kcal
                      </span>
                      <span style={{ color: '#4ade80' }}>{formatNumber(preview.proteinG, 1)}g P</span>
                      <span style={{ color: '#60a5fa' }}>{formatNumber(preview.carbsG, 1)}g C</span>
                      <span style={{ color: '#fbbf24' }}>{formatNumber(preview.fatG, 1)}g F</span>
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

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleAdd}
                        disabled={addPending}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors"
                        style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
                      >
                        {addPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Add to {MEAL_LABELS[addState.meal]}
                      </button>
                      <button
                        onClick={closeAdd}
                        className="px-4 py-2 rounded-lg text-sm border transition-colors"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {!addState.selected && (
                  <button
                    onClick={closeAdd}
                    className="text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function MacroProgressBar({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div className="flex items-center gap-3 mt-2">
      <span className="text-xs w-12 shrink-0" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs w-20 text-right shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
        {formatNumber(value, 1)}g / {formatNumber(goal, 0)}g
      </span>
    </div>
  );
}
