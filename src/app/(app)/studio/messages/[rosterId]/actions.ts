'use server';

import { createClient } from '@/lib/supabase/server';
import { createNotification } from '@/lib/notifications';

export async function sendMessage(
  rosterId: string,
  body: string,
): Promise<{ error?: string }> {
  const trimmed = body.trim();
  if (!trimmed) return { error: 'Message cannot be empty.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  // Look up roster to find both participants
  const { data: roster } = await supabase
    .from('client_roster')
    .select('id, member_user_id, creator_id')
    .eq('id', rosterId)
    .maybeSingle();

  if (!roster) return { error: 'Conversation not found.' };

  // Verify sender is one of the two participants
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id, user_id')
    .eq('id', roster.creator_id)
    .maybeSingle();

  const isCreator = creator?.user_id === user.id;
  const isMember  = roster.member_user_id === user.id;
  if (!isCreator && !isMember) return { error: 'Not authorized.' };

  // Insert the message
  const { error: insertErr } = await supabase.from('messages').insert({
    roster_id: rosterId,
    sender_id: user.id,
    body: trimmed,
  });

  if (insertErr) return { error: 'Failed to send message.' };

  // Fire notification for the other participant (non-blocking)
  const recipientUserId = isCreator ? roster.member_user_id : creator!.user_id;
  const notifHref = isCreator ? '/my-program/messages' : `/studio/messages/${rosterId}`;

  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('username, name')
    .eq('user_id', user.id)
    .maybeSingle();
  const senderName = senderProfile?.username ?? senderProfile?.name ?? 'Someone';

  await createNotification({
    userId: recipientUserId,
    type: 'new_message',
    title: 'New message',
    body: `${senderName}: ${trimmed.slice(0, 80)}${trimmed.length > 80 ? '…' : ''}`,
    href: notifHref,
  });

  return {};
}
