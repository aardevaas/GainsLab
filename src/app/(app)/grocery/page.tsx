import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { GroceryListClient } from './GroceryListClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Grocery List' };

function weekOf(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function formatWeek(weekOfStr: string): string {
  const start = new Date(weekOfStr + 'T12:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default async function GroceryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const wo = weekOf();

  // Get or create current week's list
  let listId: string;
  const { data: existing } = await supabase
    .from('grocery_lists')
    .select('id')
    .eq('user_id', user!.id)
    .eq('week_of', wo)
    .single();

  if (existing) {
    listId = existing.id;
  } else {
    const { data: created } = await supabase
      .from('grocery_lists')
      .insert({ user_id: user!.id, name: 'Weekly grocery list', week_of: wo, is_complete: false })
      .select('id')
      .single();
    listId = created?.id ?? '';
  }

  const { data: items } = await supabase
    .from('grocery_items')
    .select('*')
    .eq('list_id', listId)
    .order('category')
    .order('is_checked');

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Grocery List
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Week of {formatWeek(wo)}
          </p>
        </div>
        <Link
          href="/recipes"
          className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          <ShoppingCart size={13} /> Add from recipe
        </Link>
      </div>

      <div className="flex-1 px-8 py-6 max-w-2xl">
        {listId ? (
          <GroceryListClient listId={listId} items={items ?? []} />
        ) : (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Failed to load grocery list</p>
        )}
      </div>
    </div>
  );
}
