'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createNotification } from '@/lib/notifications';

export type JoinRequestResult =
  | { status: 'sent' }
  | { status: 'already_member' }
  | { status: 'already_requested' }
  | { status: 'error'; message: string };

export async function requestToJoin(creatorId: string): Promise<JoinRequestResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  if (creatorId === user.id) return { status: 'error', message: 'That\'s you.' };

  // Guard: creator must be accepting clients
  const { data: creatorCheck } = await supabase
    .from('creator_profiles')
    .select('is_accepting_clients')
    .eq('id', creatorId)
    .maybeSingle();
  if (!creatorCheck?.is_accepting_clients) {
    return { status: 'error', message: 'This creator is not accepting new clients right now.' };
  }

  // Check if any roster entry already exists for this pair
  const { data: existing } = await supabase
    .from('client_roster')
    .select('id, status, notes')
    .eq('creator_id', creatorId)
    .eq('member_user_id', user.id)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'active') return { status: 'already_member' };
    if (existing.notes === '__join_request__') return { status: 'already_requested' };
    return { status: 'already_member' };
  }

  const { error } = await supabase.from('client_roster').insert({
    creator_id: creatorId,
    member_user_id: user.id,
    status: 'paused',
    notes: '__join_request__',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: null,
    program_id: null,
    payment_amount_bob: null,
    payment_submission_id: null,
  });

  if (error) return { status: 'error', message: 'Failed to send request. Try again.' };

  // Notify the creator
  const [memberProfile, creatorProfile] = await Promise.all([
    supabase.from('profiles').select('username, name').eq('user_id', user.id).maybeSingle(),
    supabase.from('creator_profiles').select('user_id').eq('id', creatorId).maybeSingle(),
  ]);
  const memberName = memberProfile.data?.username ?? memberProfile.data?.name ?? 'Someone';
  if (creatorProfile.data?.user_id) {
    await createNotification({
      userId: creatorProfile.data.user_id,
      type: 'join_request',
      title: 'New join request',
      body: `@${memberName} wants to join your program.`,
      href: '/studio/clients',
    });
  }

  revalidatePath(`/creator/${creatorId}`);
  return { status: 'sent' };
}
