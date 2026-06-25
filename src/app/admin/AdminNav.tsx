'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  pendingPayments: number;
  pendingCreators: number;
};

export function AdminNav({ pendingPayments, pendingCreators }: Props) {
  const pathname = usePathname();

  const tabs = [
    { label: 'Overview', href: '/admin', exact: true, badge: 0 },
    { label: 'Creators', href: '/admin/creators', exact: false, badge: pendingCreators },
    { label: 'Payments', href: '/admin/payments', exact: false, badge: pendingPayments },
    { label: 'Users', href: '/admin/users', exact: false, badge: 0 },
  ];

  return (
    <div style={{ display: 'flex', gap: 0, paddingLeft: 20, borderTop: '1px solid var(--color-border)' }}>
      {tabs.map(({ label, href, exact, badge }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 14px', fontSize: 13, fontWeight: active ? 700 : 500,
            color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
            textDecoration: 'none',
            borderBottom: active ? '2px solid var(--color-text)' : '2px solid transparent',
            transition: 'all 150ms ease',
            marginBottom: -1,
          }}>
            {label}
            {badge > 0 && (
              <span style={{
                minWidth: 18, height: 18, borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800,
                background: '#f87171', color: '#fff',
                padding: '0 4px',
              }}>
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
