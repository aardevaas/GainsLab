'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type ManageState = { error?: string; success?: boolean };

async function getCreatorId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('creator_profiles').select('id').eq('user_id', userId).maybeSingle();
  return data?.id ?? null;
}

export async function assignProgram(
  _prev: ManageState,
  formData: FormData,
): Promise<ManageState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const clientId = String(formData.get('clientId') ?? '');
  const programId = String(formData.get('programId') ?? '').trim() || null;

  const creatorId = await getCreatorId(supabase, user.id);
  if (!creatorId) return { error: 'Creator profile not found.' };

  const { error } = await supabase
    .from('client_roster')
    .update({ program_id: programId, current_week: 1 })
    .eq('id', clientId)
    .eq('creator_id', creatorId);

  if (error) return { error: 'Failed to assign program.' };

  revalidatePath(`/studio/clients/${clientId}`);
  return { success: true };
}

export async function updateRosterStatus(
  _prev: ManageState,
  formData: FormData,
): Promise<ManageState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const clientId = String(formData.get('clientId') ?? '');
  const status = String(formData.get('status') ?? '') as 'active' | 'paused' | 'completed' | 'cancelled';

  if (!['active', 'paused', 'completed', 'cancelled'].includes(status)) {
    return { error: 'Invalid status.' };
  }

  const creatorId = await getCreatorId(supabase, user.id);
  if (!creatorId) return { error: 'Creator profile not found.' };

  const { error } = await supabase
    .from('client_roster')
    .update({ status })
    .eq('id', clientId)
    .eq('creator_id', creatorId);

  if (error) return { error: 'Failed to update status.' };

  revalidatePath(`/studio/clients/${clientId}`);
  revalidatePath('/studio/clients');
  return { success: true };
}

export async function updateClientNotes(
  _prev: ManageState,
  formData: FormData,
): Promise<ManageState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const clientId = String(formData.get('clientId') ?? '');
  const notes = String(formData.get('notes') ?? '').trim() || null;

  const creatorId = await getCreatorId(supabase, user.id);
  if (!creatorId) return { error: 'Creator profile not found.' };

  const { error } = await supabase
    .from('client_roster')
    .update({ notes })
    .eq('id', clientId)
    .eq('creator_id', creatorId);

  if (error) return { error: 'Failed to save notes.' };

  revalidatePath(`/studio/clients/${clientId}`);
  return { success: true };
}
