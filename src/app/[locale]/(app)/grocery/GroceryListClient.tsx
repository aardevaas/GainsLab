'use client';

import { useState, useOptimistic, useTransition } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { checkItem, addItem, deleteItem, clearCheckedItems } from './actions';

type GroceryItem = {
  id: string;
  ingredient: string;
  quantity: number | null;
  unit: string | null;
  is_checked: boolean;
  category: string | null;
};

type Props = {
  listId: string;
  items: GroceryItem[];
};

const CATEGORY_ORDER = ['Produce', 'Meat & Fish', 'Dairy & Eggs', 'Grains & Bread', 'Cans & Jars', 'Pantry', 'Other'];
const CATEGORIES = [...CATEGORY_ORDER];

export function GroceryListClient({ listId, items: initialItems }: Props) {
  const [optimisticItems, updateOptimistic] = useOptimistic<GroceryItem[], { type: 'check'; id: string; checked: boolean } | { type: 'delete'; id: string } | { type: 'add'; item: GroceryItem }>(
    initialItems,
    (state, action) => {
      if (action.type === 'check') return state.map(i => i.id === action.id ? { ...i, is_checked: action.checked } : i);
      if (action.type === 'delete') return state.filter(i => i.id !== action.id);
      if (action.type === 'add') return [...state, action.item];
      return state;
    }
  );

  const [, startTransition] = useTransition();
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [newItem, setNewItem] = useState('');

  const checkedCount = optimisticItems.filter(i => i.is_checked).length;

  function handleCheck(id: string, checked: boolean) {
    startTransition(async () => {
      updateOptimistic({ type: 'check', id, checked });
      await checkItem(id, checked);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      updateOptimistic({ type: 'delete', id });
      await deleteItem(id);
    });
  }

  function handleAdd(category: string) {
    if (!newItem.trim()) return;
    const tempItem: GroceryItem = {
      id: `temp-${Date.now()}`,
      ingredient: newItem.trim(),
      quantity: null,
      unit: null,
      is_checked: false,
      category,
    };
    startTransition(async () => {
      updateOptimistic({ type: 'add', item: tempItem });
      await addItem(listId, tempItem.ingredient, category);
      setNewItem('');
      setAddingCategory(null);
    });
  }

  function handleClearChecked() {
    startTransition(async () => {
      await clearCheckedItems(listId);
    });
  }

  // Group by category
  const byCategory: Record<string, GroceryItem[]> = {};
  for (const item of optimisticItems) {
    const cat = item.category ?? 'Other';
    (byCategory[cat] ??= []).push(item);
  }

  const sortedCategories = [
    ...CATEGORY_ORDER.filter(c => byCategory[c]?.length),
    ...Object.keys(byCategory).filter(c => !CATEGORY_ORDER.includes(c)),
  ];

  const unchecked = optimisticItems.filter(i => !i.is_checked).length;

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <span style={{ color: 'var(--color-text)' }} className="font-semibold">{unchecked}</span> items remaining
          {checkedCount > 0 && ` · ${checkedCount} checked`}
        </p>
        {checkedCount > 0 && (
          <button
            onClick={handleClearChecked}
            className="text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Clear checked
          </button>
        )}
      </div>

      {/* Category sections */}
      {sortedCategories.length === 0 ? (
        <div
          className="rounded-xl border p-8 text-center"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Your list is empty. Add ingredients from a recipe or type below.
          </p>
        </div>
      ) : (
        sortedCategories.map(category => (
          <section key={category}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                {category}
              </p>
              <button
                onClick={() => setAddingCategory(addingCategory === category ? null : category)}
                className="size-5 flex items-center justify-center rounded"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="rounded-xl border overflow-hidden divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {(byCategory[category] ?? []).map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 group"
                  style={{ background: item.is_checked ? 'var(--color-surface-elevated)' : 'var(--color-surface)' }}
                >
                  <button
                    onClick={() => handleCheck(item.id, !item.is_checked)}
                    className="size-5 rounded border flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: item.is_checked ? 'var(--color-accent)' : 'var(--color-border)',
                      background: item.is_checked ? 'var(--color-accent)' : 'transparent',
                    }}
                  >
                    {item.is_checked && <Check size={11} style={{ color: '#0a0c0f' }} />}
                  </button>
                  <span
                    className="flex-1 text-sm capitalize"
                    style={{
                      color: item.is_checked ? 'var(--color-text-muted)' : 'var(--color-text)',
                      textDecoration: item.is_checked ? 'line-through' : 'none',
                    }}
                  >
                    {item.ingredient}
                  </span>
                  {item.unit && (
                    <span className="text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                      {item.unit}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="size-5 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}

              {/* Inline add row */}
              {addingCategory === category && (
                <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'var(--color-surface-elevated)' }}>
                  <input
                    autoFocus
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAdd(category); if (e.key === 'Escape') { setAddingCategory(null); setNewItem(''); } }}
                    placeholder="Add ingredient..."
                    className="flex-1 text-sm outline-none bg-transparent"
                    style={{ color: 'var(--color-text)' }}
                  />
                  <button
                    onClick={() => handleAdd(category)}
                    className="text-xs font-semibold px-2 py-1 rounded"
                    style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
                  >
                    Add
                  </button>
                  <button onClick={() => { setAddingCategory(null); setNewItem(''); }} style={{ color: 'var(--color-text-muted)' }}>
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          </section>
        ))
      )}

      {/* Add to any category */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>Add item</p>
        <div className="flex gap-2">
          <input
            placeholder="Ingredient name..."
            value={addingCategory === '__new' ? newItem : ''}
            onChange={e => { setNewItem(e.target.value); setAddingCategory('__new'); }}
            onKeyDown={e => {
              if (e.key === 'Enter' && newItem.trim()) handleAdd('Other');
            }}
            className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--color-accent)]"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
          <select
            className="px-3 py-2.5 rounded-xl border text-sm outline-none"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            id="category-select"
            defaultValue="Other"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={() => {
              const sel = (document.getElementById('category-select') as HTMLSelectElement)?.value ?? 'Other';
              if (newItem.trim()) handleAdd(sel);
            }}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Trash icon for bulk */}
      {checkedCount > 0 && (
        <button
          onClick={handleClearChecked}
          className="flex items-center gap-2 text-xs"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Trash2 size={13} /> Remove {checkedCount} checked item{checkedCount !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}
