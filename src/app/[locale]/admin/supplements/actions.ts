'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { EvidenceLevel, PriceTier, SupplementGoal } from '@/lib/supplements/types';

export type SupplementInput = {
  slug: string;
  name: string;
  category: string;
  goals: SupplementGoal[];
  evidence: EvidenceLevel;
  summary: string;
  mechanism: string;
  dosage: string;
  timing: string;
  notes: string;
  price_tier: PriceTier;
};

export type SupplementState = { error?: string; id?: string };

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('user_id', user.id).single();
  if (!profile?.is_admin) redirect('/dashboard');

  return { supabase };
}

export async function createSupplement(input: SupplementInput): Promise<SupplementState> {
  const { supabase } = await requireAdmin();

  if (!input.slug.trim() || !input.name.trim()) {
    return { error: 'Slug and name are required.' };
  }

  const { data, error } = await supabase
    .from('supplements')
    .insert({
      slug: input.slug.trim(),
      name: input.name.trim(),
      category: input.category.trim(),
      goals: input.goals,
      evidence: input.evidence,
      summary: input.summary.trim(),
      mechanism: input.mechanism.trim(),
      dosage: input.dosage.trim(),
      timing: input.timing.trim(),
      notes: input.notes.trim() || null,
      price_tier: input.price_tier,
      is_published: false,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'That slug is already in use.' };
    return { error: error.message };
  }

  revalidatePath('/admin/supplements');
  return { id: data.id };
}

export async function updateSupplement(id: string, input: SupplementInput): Promise<SupplementState> {
  const { supabase } = await requireAdmin();

  if (!input.slug.trim() || !input.name.trim()) {
    return { error: 'Slug and name are required.' };
  }

  const { error } = await supabase
    .from('supplements')
    .update({
      slug: input.slug.trim(),
      name: input.name.trim(),
      category: input.category.trim(),
      goals: input.goals,
      evidence: input.evidence,
      summary: input.summary.trim(),
      mechanism: input.mechanism.trim(),
      dosage: input.dosage.trim(),
      timing: input.timing.trim(),
      notes: input.notes.trim() || null,
      price_tier: input.price_tier,
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') return { error: 'That slug is already in use.' };
    return { error: error.message };
  }

  revalidatePath('/admin/supplements');
  revalidatePath('/supplements');
  return { id };
}

export async function deleteSupplement(id: string): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from('supplements').delete().eq('id', id);
  revalidatePath('/admin/supplements');
  revalidatePath('/supplements');
}

export async function toggleSupplementPublish(id: string, current: boolean): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from('supplements').update({ is_published: !current }).eq('id', id);
  revalidatePath('/admin/supplements');
  revalidatePath('/supplements');
}
