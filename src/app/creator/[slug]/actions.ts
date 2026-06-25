'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

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

  revalidatePath(`/creator/${creatorId}`);
  return { status: 'sent' };
}
