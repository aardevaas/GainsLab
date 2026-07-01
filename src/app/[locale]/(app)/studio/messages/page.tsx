import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Messages' };

function fmtTime(ts: string) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default async function StudioMessagesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!creator) redirect('/apply');

  // All non-pending roster entries (real clients)
  const { data: roster } = await supabase
    .from('client_roster')
    .select('id, member_user_id, status')
    .eq('creator_id', creator.id)
    .neq('notes', '__join_request__')
    .order('created_at', { ascending: false });

  const entries = roster ?? [];
  const memberIds = [...new Set(entries.map(r => r.member_user_id))];
  const rosterIds = entries.map(r => r.id);

  const [profilesRes, lastMsgsRes, unreadRes] = await Promise.all([
    memberIds.length > 0
      ? supabase.from('profiles').select('user_id, username, name').in('user_id', memberIds)
      : Promise.resolve({ data: [] }),
    rosterIds.length > 0
      ? supabase
          .from('messages')
          .select('roster_id, body, sender_id, created_at')
          .in('roster_id', rosterIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    rosterIds.length > 0
      ? supabase
          .from('messages')
          .select('roster_id')
          .in('roster_id', rosterIds)
          .neq('sender_id', user.id)
          .is('read_at', null)
      : Promise.resolve({ data: [] }),
  ]);

  // Build lookup maps
  const profileMap = new Map<string, string>();
  for (const p of profilesRes.data ?? []) {
    profileMap.set(p.user_id, p.username ?? p.name ?? p.user_id.slice(0, 8));
  }

  const lastMsgByRoster = new Map<string, { body: string; sender_id: string; created_at: string }>();
  for (const m of lastMsgsRes.data ?? []) {
    if (!lastMsgByRoster.has(m.roster_id)) {
      lastMsgByRoster.set(m.roster_id, m);
    }
  }

  const unreadByRoster = new Map<string, number>();
  for (const m of unreadRes.data ?? []) {
    unreadByRoster.set(m.roster_id, (unreadByRoster.get(m.roster_id) ?? 0) + 1);
  }

  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
          Messages
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
          {entries.length} conversation{entries.length !== 1 ? 's' : ''}
        </p>
      </div>

      {entries.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 14, padding: '60px 24px', textAlign: 'center',
          border: '1px dashed var(--color-border)', borderRadius: 16,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(96,165,250,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageSquare size={20} style={{ color: '#60a5fa' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 5px' }}>
              No conversations yet
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, maxWidth: 280 }}>
              Once you have active clients, your message threads will appear here.
            </p>
          </div>
          <Link href="/studio/clients" style={{
            padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: 'rgba(96,165,250,0.1)', color: '#60a5fa', textDecoration: 'none',
          }}>
            Go to Clients
          </Link>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
          {entries.map((r, i) => {
            const name = profileMap.get(r.member_user_id) ?? r.member_user_id.slice(0, 8);
            const last = lastMsgByRoster.get(r.id);
            const unread = unreadByRoster.get(r.id) ?? 0;
            const isMe = last?.sender_id === user.id;

            return (
              <Link key={r.id} href={`/studio/messages/${r.id}`} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px',
                borderBottom: i < entries.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                background: unread > 0 ? 'rgba(96,165,250,0.03)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 100ms ease',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(96,165,250,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800, color: '#60a5fa',
                  position: 'relative',
                }}>
                  {name.slice(0, 2).toUpperCase()}
                  {unread > 0 && (
                    <span style={{
                      position: 'absolute', top: -2, right: -2,
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#60a5fa', color: '#0a0c0f',
                      fontSize: 10, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>

                {/* Name + preview */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 14, fontWeight: unread > 0 ? 700 : 600,
                    color: 'var(--color-text)', margin: '0 0 3px',
                  }}>
                    @{name}
                  </p>
                  {last ? (
                    <p style={{
                      fontSize: 13,
                      color: unread > 0 ? 'var(--color-text)' : 'var(--color-text-muted)',
                      fontWeight: unread > 0 ? 500 : 400,
                      margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {isMe ? 'You: ' : ''}{last.body}
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, fontStyle: 'italic' }}>
                      No messages yet — say hi!
                    </p>
                  )}
                </div>

                {/* Time + chevron */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  {last && (
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {fmtTime(last.created_at)}
                    </span>
                  )}
                  <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
