'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Dumbbell, Users, ExternalLink, BadgeCheck, ClipboardCheck, Settings } from 'lucide-react';

const NAV = [
  { label: 'Dashboard', href: '/studio', icon: LayoutDashboard, exact: true },
  { label: 'Programs', href: '/studio/programs', icon: Dumbbell, exact: false },
  { label: 'Clients', href: '/studio/clients', icon: Users, exact: false },
  { label: 'Check-ins', href: '/studio/checkins', icon: ClipboardCheck, exact: false },
  { label: 'Settings', href: '/studio/settings', icon: Settings, exact: false },
];

type Props = {
  displayName: string;
  slug: string;
  avatarUrl: string | null;
  isVerified: boolean;
};

export function StudioNav({ displayName, slug, avatarUrl, isVerified }: Props) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div style={{
      background: 'var(--color-bg-secondary)',
      borderBottom: '1px solid var(--color-border-subtle)',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Studio badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
            color: '#60a5fa', fontFamily: 'var(--font-mono)',
            background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.25)',
            padding: '3px 8px', borderRadius: 5,
          }}>
            Creator Studio
          </div>
          <span style={{ color: 'var(--color-border)', fontSize: 16 }}>·</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: 'rgba(96,165,250,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#60a5fa',
              }}>
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{displayName}</span>
            {isVerified && <BadgeCheck size={13} style={{ color: '#60a5fa' }} />}
          </div>
        </div>

        <Link
          href={`/creator/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)',
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={11} />
          View Public Profile
        </Link>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 0, paddingLeft: 20 }}>
        {NAV.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 12px', fontSize: 13, fontWeight: active ? 600 : 500,
              color: active ? '#60a5fa' : 'var(--color-text-secondary)',
              textDecoration: 'none',
              borderBottom: active ? '2px solid #60a5fa' : '2px solid transparent',
              transition: 'all 150ms ease',
              marginBottom: -1,
            }}>
              <Icon size={13} />
              {label}
            </Link>
          );
        })}
        {/* Coming soon tabs */}
        {(['Community', 'Revenue'] as const).map(l => (
          <span key={l} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', fontSize: 13, fontWeight: 500,
            color: 'var(--color-text-muted)', opacity: 0.5,
            borderBottom: '2px solid transparent',
            cursor: 'default',
          }}>
            {l}
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
              background: 'rgba(96,165,250,0.1)', color: '#60a5fa',
              padding: '1px 5px', borderRadius: 3,
            }}>Soon</span>
          </span>
        ))}
      </div>
    </div>
  );
}
