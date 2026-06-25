import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Users, TrendingUp, Dumbbell, DollarSign, ArrowRight, UserPlus } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Revenue — Studio' };

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

function MonthBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 4;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', width: 36, flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-surface-elevated)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#60a5fa', borderRadius: 3, transition: 'width 600ms ease' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)', width: 22, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {count}
      </span>
    </div>
  );
}

export default async function RevenuePageWrapper() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id, display_name, community_price_bob, total_clients, total_transformations, avg_client_rating')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!creator) redirect('/studio');

  // Fetch all roster entries (for monthly grouping and totals)
  const { data: allRoster } = await supabase
    .from('client_roster')
    .select('id, status, payment_amount_bob, created_at')
    .eq('creator_id', creator.id)
    .order('created_at', { ascending: false });

  const roster = allRoster ?? [];

  const activeClients = roster.filter(r => r.status === 'active');
  const activeCount = activeClients.length;

  // Revenue: sum payment_amount_bob where known, else fall back to price × count
  const trackedRevenue = roster.reduce((sum, r) => sum + (r.payment_amount_bob ?? 0), 0);
  const projectedMonthly = creator.community_price_bob ? creator.community_price_bob * activeCount : null;

  // Monthly new-client breakdown — last 6 months
  const now = new Date();
  const months: { key: string; label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    const count = roster.filter(r => r.created_at.slice(0, 7) === key).length;
    months.push({ key, label, count });
  }
  const maxMonthCount = Math.max(...months.map(m => m.count), 1);

  // Programs with enrollment
  const { data: programs } = await supabase
    .from('programs')
    .select('id, title, type, is_published, enrollment_count, price_bob, is_free')
    .eq('creator_id', creator.id)
    .order('enrollment_count', { ascending: false });

  const progList = programs ?? [];
  const totalEnrollments = progList.reduce((s, p) => s + p.enrollment_count, 0);

  // New this month
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const newThisMonth = roster.filter(r => r.created_at.slice(0, 7) === thisMonthKey).length;

  function typeColor(t: string) {
    return t === 'challenge' ? '#fbbf24' : t === 'one_on_one' ? '#60a5fa' : '#4ade80';
  }

  return (
    <div style={{ padding: '28px 28px 80px', maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', margin: '0 0 4px' }}>
          Revenue
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
          Your coaching business at a glance
        </p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          {
            label: 'Active Clients',
            value: activeCount,
            sub: `+${newThisMonth} this month`,
            icon: <Users size={15} />,
            color: '#60a5fa',
          },
          {
            label: 'Projected / Month',
            value: projectedMonthly != null ? `Bs. ${fmt(projectedMonthly)}` : '—',
            sub: creator.community_price_bob ? `Bs. ${creator.community_price_bob}/client/mo` : 'Set price in Settings',
            icon: <DollarSign size={15} />,
            color: '#4ade80',
          },
          {
            label: 'Program Enrollments',
            value: totalEnrollments,
            sub: `across ${progList.length} program${progList.length !== 1 ? 's' : ''}`,
            icon: <Dumbbell size={15} />,
            color: '#a78bfa',
          },
          {
            label: 'All-time Clients',
            value: creator.total_clients,
            sub: `${creator.total_transformations} transformations`,
            icon: <TrendingUp size={15} />,
            color: '#fb923c',
          },
        ].map(card => (
          <div key={card.label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 14, padding: '20px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', margin: 0 }}>
                {card.label}
              </p>
              <span style={{ color: card.color, opacity: 0.7 }}>{card.icon}</span>
            </div>
            <p style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.04em', margin: '0 0 4px', lineHeight: 1 }}>
              {card.value}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column: growth + programs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 18 }}>

        {/* Monthly growth */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              New Clients — 6 Months
            </p>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {months.map(m => (
              <MonthBar key={m.key} label={m.label} count={m.count} max={maxMonthCount} />
            ))}
            {roster.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px 0' }}>
                No clients yet — add your first from the Clients tab.
              </p>
            )}
          </div>
        </div>

        {/* Programs */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Program Performance</p>
            <Link href="/studio/programs" style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              Manage <ArrowRight size={11} />
            </Link>
          </div>
          {progList.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 16px' }}>No programs yet.</p>
              <Link href="/studio/programs/new" style={{
                fontSize: 12, fontWeight: 700, color: '#60a5fa', textDecoration: 'none',
                border: '1px solid rgba(96,165,250,0.3)', padding: '8px 16px', borderRadius: 8,
              }}>
                Create your first program →
              </Link>
            </div>
          ) : (
            <div>
              {progList.map((p, i) => {
                const tc = typeColor(p.type);
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px',
                    borderBottom: i < progList.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', background: tc, flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0, fontFamily: 'var(--font-mono)' }}>
                        {p.is_free ? 'Free' : `Bs. ${p.price_bob}`} ·{' '}
                        {p.is_published ? <span style={{ color: '#4ade80' }}>Live</span> : <span>Draft</span>}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {p.enrollment_count}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: 0 }}>enrolled</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* If no price is set — nudge */}
      {!creator.community_price_bob && (
        <div style={{
          marginTop: 18, padding: '16px 20px', borderRadius: 12,
          background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <UserPlus size={16} style={{ color: '#60a5fa', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 2px' }}>
                Set your community price
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                Add a monthly rate in Settings to enable projected revenue tracking.
              </p>
            </div>
          </div>
          <Link href="/studio/settings" style={{
            flexShrink: 0, fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 8,
            background: 'rgba(96,165,250,0.12)', color: '#60a5fa',
            textDecoration: 'none', border: '1px solid rgba(96,165,250,0.25)',
          }}>
            Go to Settings →
          </Link>
        </div>
      )}
    </div>
  );
}
