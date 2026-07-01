import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ThreadClient } from './ThreadClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Messages' };

export default async function CreatorThreadPage(
  { params }: { params: Promise<{ rosterId: string }> }
) {
  const { rosterId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!creator) redirect('/apply');

  // Verify creator owns this roster entry
  const { data: roster } = await supabase
    .from('client_roster')
    .select('id, member_user_id')
    .eq('id', rosterId)
    .eq('creator_id', creator.id)
    .maybeSingle();
  if (!roster) notFound();

  const [profileRes, messagesRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('username, name')
      .eq('user_id', roster.member_user_id)
      .maybeSingle(),
    supabase
      .from('messages')
      .select('id, sender_id, body, read_at, created_at')
      .eq('roster_id', rosterId)
      .order('created_at', { ascending: true })
      .limit(100),
  ]);

  const profile = profileRes.data;
  const memberName = profile?.username ?? profile?.name ?? roster.member_user_id.slice(0, 8);
  const initialMessages = messagesRes.data ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      {/* Back nav */}
      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid var(--color-border-subtle)',
        flexShrink: 0,
      }}>
        <Link href="/studio/messages" style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)',
          textDecoration: 'none',
        }}>
          <ArrowLeft size={12} /> All messages
        </Link>
      </div>

      <ThreadClient
        rosterId={rosterId}
        currentUserId={user.id}
        partnerName={memberName}
        initialMessages={initialMessages}
      />
    </div>
  );
}
