import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ThreadClient } from '@/app/(app)/studio/messages/[rosterId]/ThreadClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Messages' };

export default async function MemberMessagesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Member's active roster entry
  const { data: roster } = await supabase
    .from('client_roster')
    .select('id, creator_id')
    .eq('member_user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!roster) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh',
        gap: 16, padding: '40px 24px', textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(96,165,250,0.08)',
          border: '1px solid rgba(96,165,250,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MessageSquare size={22} style={{ color: '#60a5fa' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 6px' }}>
            No active program
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, maxWidth: 300 }}>
            Join a coaching program first. Once your trainer approves you, messages will appear here.
          </p>
        </div>
        <Link href="/discover" style={{
          padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
          background: 'rgba(96,165,250,0.1)', color: '#60a5fa', textDecoration: 'none',
        }}>
          Find a Coach
        </Link>
      </div>
    );
  }

  const [creatorRes, messagesRes] = await Promise.all([
    supabase
      .from('creator_profiles')
      .select('display_name, slug')
      .eq('id', roster.creator_id)
      .single(),
    supabase
      .from('messages')
      .select('id, sender_id, body, read_at, created_at')
      .eq('roster_id', roster.id)
      .order('created_at', { ascending: true })
      .limit(100),
  ]);

  const creatorName = creatorRes.data?.display_name ?? 'Your Coach';
  const initialMessages = messagesRes.data ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      {/* Back nav */}
      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid var(--color-border-subtle)',
        flexShrink: 0,
      }}>
        <Link href="/my-program" style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)',
          textDecoration: 'none',
        }}>
          <ArrowLeft size={12} /> My Program
        </Link>
      </div>

      <ThreadClient
        rosterId={roster.id}
        currentUserId={user.id}
        partnerName={creatorName}
        initialMessages={initialMessages}
      />
    </div>
  );
}
