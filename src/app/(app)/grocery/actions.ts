'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function weekOf(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

export async function getOrCreateCurrentList(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const wo = weekOf();
  const { data: existing } = await supabase
    .from('grocery_lists')
    .select('id')
    .eq('user_id', user.id)
    .eq('week_of', wo)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('grocery_lists')
    .insert({ user_id: user.id, name: 'Weekly grocery list', week_of: wo, is_complete: false })
    .select('id')
    .single();

  if (error || !created) throw new Error('Failed to create grocery list');
  return created.id;
}

export async function checkItem(itemId: string, checked: boolean): Promise<void> {
  const supabase = await createClient();
  await supabase.from('grocery_items').update({ is_checked: checked }).eq('id', itemId);
  revalidatePath('/grocery');
}

export async function addItem(listId: string, ingredient: string, category: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from('grocery_items').insert({
    list_id: listId,
    ingredient,
    quantity: null,
    unit: null,
    is_checked: false,
    category,
  });
  revalidatePath('/grocery');
}

export async function deleteItem(itemId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from('grocery_items').delete().eq('id', itemId);
  revalidatePath('/grocery');
}

export async function clearCheckedItems(listId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from('grocery_items').delete().eq('list_id', listId).eq('is_checked', true);
  revalidatePath('/grocery');
}
