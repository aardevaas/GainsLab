'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { sendMessage } from './actions';

type Message = {
  id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

type Props = {
  rosterId: string;
  currentUserId: string;
  partnerName: string;
  initialMessages: Message[];
};

function fmtTime(ts: string) {
  const d = new Date(ts);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function ThreadClient({ rosterId, currentUserId, partnerName, initialMessages }: Props) {
  const supabase = useRef(createClient()).current;
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark partner messages as read on mount
  useEffect(() => {
    supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('roster_id', rosterId)
      .neq('sender_id', currentUserId)
      .is('read_at', null)
      .then(() => {});
  }, [rosterId, currentUserId, supabase]);

  // Realtime subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`thread-${rosterId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `roster_id=eq.${rosterId}` },
        (payload) => {
          const msg = payload.new as Message;
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          if (msg.sender_id !== currentUserId) {
            supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', msg.id)
              .then(() => {});
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [rosterId, currentUserId, supabase]);

  async function send() {
    const text = body.trim();
    if (!text || sending) return;
    setError(null);
    setSending(true);
    setBody('');

    const result = await sendMessage(rosterId, text);

    if (result.error) {
      setError(result.error);
      setBody(text);
    }
    setSending(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // Group messages by date for day dividers
  type Group = { date: string; msgs: Message[] };
  const groups: Group[] = [];
  for (const m of messages) {
    const day = new Date(m.created_at).toDateString();
    const last = groups[groups.length - 1];
    if (last && last.date === day) {
      last.msgs.push(m);
    } else {
      groups.push({ date: day, msgs: [m] });
    }
  }

  function dayLabel(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(Date.now() - 86_400_000);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Thread header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'var(--color-surface)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(96,165,250,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#60a5fa', flexShrink: 0,
          }}>
            {partnerName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              @{partnerName}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
              End-to-end encrypted · messages are private
            </p>
          </div>
        </div>
      </div>

      {/* Messages scroll area */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 20px 8px',
        display: 'flex', flexDirection: 'column', gap: 0,
        minHeight: 0,
      }}>
        {messages.length === 0 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10,
            textAlign: 'center', padding: '40px 20px',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(96,165,250,0.08)',
              border: '1px solid rgba(96,165,250,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Send size={18} style={{ color: '#60a5fa' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Start the conversation
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, maxWidth: 280 }}>
              Send a message to @{partnerName} to kick things off.
            </p>
          </div>
        )}

        {groups.map(group => (
          <div key={group.date}>
            {/* Day divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              margin: '16px 0 12px',
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
              <span style={{
                fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}>
                {dayLabel(group.date)}
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
            </div>

            {/* Messages in this group */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {group.msgs.map((m, i) => {
                const isMine = m.sender_id === currentUserId;
                const prevSame = i > 0 && group.msgs[i - 1].sender_id === m.sender_id;
                return (
                  <div key={m.id} style={{
                    display: 'flex',
                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                    marginTop: prevSame ? 2 : 8,
                  }}>
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{
                        padding: '9px 14px',
                        borderRadius: isMine
                          ? (prevSame ? '14px 4px 4px 14px' : '14px 4px 14px 14px')
                          : (prevSame ? '4px 14px 14px 4px' : '4px 14px 14px 14px'),
                        background: isMine
                          ? 'var(--color-accent)'
                          : 'var(--color-surface-elevated)',
                        border: isMine ? 'none' : '1px solid var(--color-border-subtle)',
                      }}>
                        <p style={{
                          fontSize: 14, lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          color: isMine ? '#0a0c0f' : 'var(--color-text)',
                        }}>
                          {m.body}
                        </p>
                      </div>
                      <p style={{
                        fontSize: 10, color: 'var(--color-text-muted)',
                        margin: '3px 4px 0',
                        textAlign: isMine ? 'right' : 'left',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {fmtTime(m.created_at)}
                        {isMine && m.read_at && (
                          <span style={{ marginLeft: 6, color: '#60a5fa' }}>✓ read</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--color-border-subtle)',
        background: 'var(--color-surface)',
        flexShrink: 0,
      }}>
        {error && (
          <p style={{ fontSize: 12, color: '#f87171', margin: '0 0 8px', padding: '0 4px' }}>{error}</p>
        )}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message…"
            rows={1}
            disabled={sending}
            style={{
              flex: 1,
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 14,
              color: 'var(--color-text)',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.5,
              maxHeight: 120,
              overflowY: 'auto',
            }}
            onInput={e => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 120) + 'px';
            }}
          />
          <button
            type="button"
            onClick={send}
            disabled={!body.trim() || sending}
            style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: body.trim() && !sending ? 'var(--color-accent)' : 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              cursor: body.trim() && !sending ? 'pointer' : 'not-allowed',
              transition: 'background 150ms ease',
            }}
          >
            {sending
              ? <Loader2 size={16} style={{ color: 'var(--color-text-muted)', animation: 'spin 0.8s linear infinite' }} />
              : <Send size={16} style={{ color: body.trim() ? '#0a0c0f' : 'var(--color-text-muted)' }} />
            }
          </button>
        </div>
        <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '6px 4px 0', fontFamily: 'var(--font-mono)' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
