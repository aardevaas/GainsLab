'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/lib/notifications';

export type ClientState = { error?: string; success?: boolean };

export async function assignClient(
  _prev: ClientState,
  formData: FormData,
): Promise<ClientState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: creator } = await supabase
    .from('creator_profiles').select('id').eq('user_id', user.id).maybeSingle();
  if (!creator) return { error: 'Creator profile not found.' };

  const username = String(formData.get('username') ?? '').trim().toLowerCase();
  if (!username) return { error: 'Enter the member\'s username.' };

  const program_id = String(formData.get('program_id') ?? '').trim() || null;
  const start_date = String(formData.get('start_date') ?? new Date().toISOString().slice(0, 10));
  const notes = String(formData.get('notes') ?? '').trim() || null;

  const { data: memberProfile } = await supabase
    .from('profiles').select('user_id').eq('username', username).maybeSingle();

  if (!memberProfile) return { error: `No member found with username "${username}". They must have a GainsLab account.` };

  if (memberProfile.user_id === user.id) return { error: 'You cannot add yourself as a client.' };

  const { error } = await supabase.from('client_roster').insert({
    creator_id: creator.id,
    member_user_id: memberProfile.user_id,
    program_id: program_id || null,
    start_date,
    notes,
    end_date: null,
    payment_amount_bob: null,
    payment_submission_id: null,
  });

  if (error) {
    if (error.code === '23505') return { error: 'This member is already on your roster.' };
    return { error: 'Something went wrong adding the client.' };
  }

  const { data: creatorProfile } = await supabase
    .from('creator_profiles').select('display_name').eq('user_id', user.id).maybeSingle();

  await createNotification({
    userId: memberProfile.user_id,
    type: 'added_to_roster',
    title: 'You\'ve been added to a coaching program',
    body: `${creatorProfile?.display_name ?? 'A coach'} has added you to their roster. Check your program now.`,
    href: '/my-program',
  });

  revalidatePath('/studio/clients');
  return { success: true };
}

export async function updateClientStatus(
  clientId: string,
  status: 'active' | 'paused' | 'completed' | 'cancelled',
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: creator } = await supabase
    .from('creator_profiles').select('id').eq('user_id', user.id).maybeSingle();
  if (!creator) return;

  await supabase.from('client_roster')
    .update({ status })
    .eq('id', clientId)
    .eq('creator_id', creator.id);

  revalidatePath('/studio/clients');
}

export async function approveJoinRequest(clientId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: creator } = await supabase
    .from('creator_profiles').select('id, display_name, user_id').eq('user_id', user.id).maybeSingle();
  if (!creator) return;

  const { data: roster } = await supabase
    .from('client_roster')
    .select('member_user_id')
    .eq('id', clientId)
    .eq('creator_id', creator.id)
    .maybeSingle();

  await supabase.from('client_roster')
    .update({ status: 'active', notes: null, start_date: new Date().toISOString().slice(0, 10) })
    .eq('id', clientId)
    .eq('creator_id', creator.id);

  if (roster?.member_user_id) {
    const creatorName = creator.display_name ?? 'Your coach';
    await createNotification({
      userId: roster.member_user_id,
      type: 'join_approved',
      title: 'Join request approved!',
      body: `${creatorName} approved you. You're now an active client.`,
      href: '/my-program',
    });
  }

  revalidatePath('/studio/clients');
}

export async function declineJoinRequest(clientId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: creator } = await supabase
    .from('creator_profiles').select('id, display_name').eq('user_id', user.id).maybeSingle();
  if (!creator) return;

  const { data: roster } = await supabase
    .from('client_roster')
    .select('member_user_id')
    .eq('id', clientId)
    .eq('creator_id', creator.id)
    .maybeSingle();

  await supabase.from('client_roster')
    .delete()
    .eq('id', clientId)
    .eq('creator_id', creator.id);

  if (roster?.member_user_id) {
    const creatorName = creator.display_name ?? 'The coach';
    await createNotification({
      userId: roster.member_user_id,
      type: 'join_declined',
      title: 'Join request declined',
      body: `${creatorName} couldn't take you on right now.`,
      href: '/discover',
    });
  }

  revalidatePath('/studio/clients');
}
