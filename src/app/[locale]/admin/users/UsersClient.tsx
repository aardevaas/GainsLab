'use client';

import { useState, useTransition } from 'react';
import { Search, Shield, ShieldOff, Loader2 } from 'lucide-react';
import { setAdminFlag } from './actions';

type User = {
  user_id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  is_creator: boolean;
  onboarding_completed: boolean;
  created_at: string;
  isPro: boolean;
};

type Props = { users: User[]; currentUserId: string };

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function UsersClient({ users, currentUserId }: Props) {
  const [query, setQuery] = useState('');
  const [pending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = users.filter(u => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.user_id.includes(q)
    );
  });

  function toggleAdmin(u: User) {
    setTogglingId(u.user_id);
    startTransition(async () => {
      await setAdminFlag(u.user_id, !u.is_admin);
      setTogglingId(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
        <input
          className="w-full h-9 pl-9 pr-3 rounded-xl text-sm outline-none"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
          placeholder="Search by name or username…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
              {['User', 'Status', 'Joined', 'Admin'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr
                key={u.user_id}
                style={{
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border-subtle)' : undefined,
                  background: 'var(--color-bg)',
                }}
              >
                {/* User */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="size-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div
                        className="size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
                      >
                        {(u.name ?? u.username ?? '?')[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold leading-tight" style={{ color: 'var(--color-text)' }}>
                        {u.name ?? '—'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {u.username ? `@${u.username}` : u.user_id.slice(0, 8) + '…'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Status badges */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {u.isPro && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase" style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}>
                        Pro
                      </span>
                    )}
                    {u.is_creator && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase" style={{ background: '#60a5fa22', color: '#60a5fa' }}>
                        Creator
                      </span>
                    )}
                    {!u.onboarding_completed && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase" style={{ background: '#fbbf2422', color: '#fbbf24' }}>
                        Incomplete
                      </span>
                    )}
                    {!u.isPro && u.onboarding_completed && !u.is_creator && (
                      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Free</span>
                    )}
                  </div>
                </td>

                {/* Joined */}
                <td className="px-4 py-3">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{fmt(u.created_at)}</span>
                </td>

                {/* Admin toggle */}
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={pending && togglingId === u.user_id || u.user_id === currentUserId}
                    onClick={() => toggleAdmin(u)}
                    title={u.user_id === currentUserId ? 'Cannot change your own admin status' : u.is_admin ? 'Revoke admin' : 'Grant admin'}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-opacity disabled:opacity-40"
                    style={u.is_admin
                      ? { background: '#4ade8022', color: '#4ade80' }
                      : { background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }
                    }
                  >
                    {pending && togglingId === u.user_id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : u.is_admin ? (
                      <Shield size={12} />
                    ) : (
                      <ShieldOff size={12} />
                    )}
                    {u.is_admin ? 'Admin' : 'User'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  No users match "{query}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
