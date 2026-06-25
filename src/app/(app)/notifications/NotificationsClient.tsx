'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  UserPlus, CheckCircle, XCircle, ClipboardCheck,
  MessageSquare, Bell, CheckCheck,
} from 'lucide-react';
import { markNotificationRead, markAllNotificationsRead } from './actions';

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

type Props = {
  initialNotifications: Notification[];
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  join_request: <UserPlus size={15} style={{ color: '#fbbf24' }} />,
  join_approved: <CheckCircle size={15} style={{ color: '#4ade80' }} />,
  join_declined: <XCircle size={15} style={{ color: '#f87171' }} />,
  checkin_submitted: <ClipboardCheck size={15} style={{ color: '#60a5fa' }} />,
  new_message: <MessageSquare size={15} style={{ color: '#a78bfa' }} />,
};

const TYPE_COLOR: Record<string, string> = {
  join_request: 'rgba(251,191,36,0.1)',
  join_approved: 'rgba(74,222,128,0.1)',
  join_declined: 'rgba(248,113,113,0.1)',
  checkin_submitted: 'rgba(96,165,250,0.1)',
  new_message: 'rgba(167,139,250,0.1)',
};

function fmtRelative(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationsClient({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [pending, startTransition] = useTransition();

  const unreadCount = notifications.filter(n => !n.read_at).length;

  function markRead(id: string) {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
    );
    startTransition(() => markNotificationRead(id));
  }

  function markAll() {
    const now = new Date().toISOString();
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? now })));
    startTransition(() => markAllNotificationsRead());
  }

  if (notifications.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 14, padding: '80px 24px', textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(96,165,250,0.08)',
          border: '1px solid rgba(96,165,250,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bell size={22} style={{ color: '#60a5fa' }} />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 6px' }}>
            All caught up
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            New activity will show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 0 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.03em' }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span style={{
              background: '#60a5fa', color: '#0a0c0f',
              fontSize: 11, fontWeight: 800, borderRadius: 20,
              padding: '2px 8px',
            }}>
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAll}
            disabled={pending}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)',
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px',
              borderRadius: 8, transition: 'color 150ms',
            }}
          >
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
        {notifications.map((n, i) => {
          const isUnread = !n.read_at;
          const icon = TYPE_ICON[n.type] ?? <Bell size={15} style={{ color: '#60a5fa' }} />;
          const accentBg = TYPE_COLOR[n.type] ?? 'rgba(96,165,250,0.08)';

          const inner = (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '14px 18px',
              borderBottom: i < notifications.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
              background: isUnread ? 'rgba(96,165,250,0.025)' : 'transparent',
              cursor: n.href ? 'pointer' : 'default',
            }}>
              {/* Icon badge */}
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: accentBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                {icon}
                {isUnread && (
                  <div style={{
                    position: 'absolute', top: -3, right: -3,
                    width: 9, height: 9, borderRadius: '50%',
                    background: '#60a5fa',
                    border: '2px solid var(--color-bg-secondary)',
                  }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 13, fontWeight: isUnread ? 700 : 500,
                  color: 'var(--color-text)', margin: '0 0 3px',
                }}>
                  {n.title}
                </p>
                {n.body && (
                  <p style={{
                    fontSize: 12, color: 'var(--color-text-muted)',
                    margin: '0 0 5px', lineHeight: 1.4,
                  }}>
                    {n.body}
                  </p>
                )}
                <p style={{
                  fontSize: 10, color: 'var(--color-text-muted)',
                  margin: 0, fontFamily: 'var(--font-mono)',
                }}>
                  {fmtRelative(n.created_at)}
                </p>
              </div>

              {/* Mark read button */}
              {isUnread && (
                <button
                  type="button"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); markRead(n.id); }}
                  title="Mark as read"
                  style={{
                    flexShrink: 0, padding: 4, borderRadius: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <CheckCheck size={13} />
                </button>
              )}
            </div>
          );

          return n.href ? (
            <Link
              key={n.id}
              href={n.href}
              onClick={() => { if (isUnread) markRead(n.id); }}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              {inner}
            </Link>
          ) : (
            <div key={n.id}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
