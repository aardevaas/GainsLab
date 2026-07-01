import { createClient } from '@/lib/supabase/server';
import { Users, Dumbbell, UserCheck, TrendingUp, Clock, Star, Activity } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Overview' };

const CARD_STYLE: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 14,
  padding: '20px 22px',
};

function StatCard({
  label, value, sub, color = '#60a5fa', icon,
}: {
  label: string; value: string | number; sub?: string; color?: string; icon: React.ReactNode;
}) {
  return (
    <div style={CARD_STYLE}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', margin: 0 }}>
          {label}
        </p>
        <div style={{ color, opacity: 0.7 }}>{icon}</div>
      </div>
      <p style={{ fontSize: 34, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.04em', margin: '0 0 4px', lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>{sub}</p>}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalCreators },
    { count: pendingCreators },
    { count: activeClients },
    { count: totalTransformations },
    { data: recentProfiles },
    { data: recentApplications },
    { data: revenueRes },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('creator_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('creator_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('client_roster').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('client_roster').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase
      .from('profiles')
      .select('name, username, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('creator_applications')
      .select('full_name, status, submitted_at')
      .order('submitted_at', { ascending: false })
      .limit(6),
    supabase
      .from('payment_submissions')
      .select('amount_extracted')
      .eq('status', 'approved'),
  ]);

  const totalRevenueBob = (revenueRes ?? []).reduce((s, p) => s + (p.amount_extracted ?? 0), 0);
  const platformCutBob = totalRevenueBob * 0.05;

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const STATUS_COLOR: Record<string, string> = {
    pending: '#fbbf24', approved: '#4ade80', rejected: '#f87171',
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', margin: '0 0 4px' }}>
          Platform Overview
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
          Live snapshot of GainsLab health
        </p>
      </div>

      {/* KPI grid */}
      <div style={{
        display: 'grid', gap: 16,
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        marginBottom: 36,
      }}>
        <StatCard label="Total Users" value={totalUsers ?? 0} sub="registered accounts" color="#60a5fa" icon={<Users size={16} />} />
        <StatCard label="Creators" value={totalCreators ?? 0} sub={`${pendingCreators ?? 0} pending review`} color="#a78bfa" icon={<Dumbbell size={16} />} />
        <StatCard label="Active Clients" value={activeClients ?? 0} sub="currently in programs" color="#4ade80" icon={<UserCheck size={16} />} />
        <StatCard label="Transformations" value={totalTransformations ?? 0} sub="programs completed" color="#34d399" icon={<TrendingUp size={16} />} />
        <StatCard
          label="Platform Revenue"
          value={`Bs. ${totalRevenueBob.toFixed(0)}`}
          sub={`~Bs. ${platformCutBob.toFixed(0)} platform cut (5%)`}
          color="#fbbf24"
          icon={<Star size={16} />}
        />
      </div>

      {/* Recent activity panels */}
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr 1fr' }}>
        {/* Recent signups */}
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
          borderRadius: 14, overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={13} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Recent Signups
            </span>
          </div>
          {(recentProfiles ?? []).length === 0 ? (
            <p style={{ padding: '20px', fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>No users yet.</p>
          ) : (recentProfiles ?? []).map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 20px',
              borderBottom: i < (recentProfiles ?? []).length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                  {p.name ?? p.username ?? 'Anonymous'}
                </p>
                {p.username && (
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '1px 0 0', fontFamily: 'var(--font-mono)' }}>
                    @{p.username}
                  </p>
                )}
              </div>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={10} />
                {fmtDate(p.created_at)}
              </span>
            </div>
          ))}
        </div>

        {/* Recent creator applications */}
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
          borderRadius: 14, overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Dumbbell size={13} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Creator Applications
            </span>
          </div>
          {(recentApplications ?? []).length === 0 ? (
            <p style={{ padding: '20px', fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>No applications yet.</p>
          ) : (recentApplications ?? []).map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 20px',
              borderBottom: i < (recentApplications ?? []).length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{a.full_name}</p>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '1px 0 0' }}>
                  {fmtDate(a.submitted_at)}
                </p>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '3px 8px', borderRadius: 4,
                background: `${STATUS_COLOR[a.status] ?? '#888'}18`,
                color: STATUS_COLOR[a.status] ?? '#888',
                fontFamily: 'var(--font-mono)',
              }}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
