import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Plus, Users, Dumbbell, Star, TrendingUp, ArrowRight, Activity } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

const STAT_CARD = {
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 14, padding: '20px 22px',
  background: 'var(--color-surface)',
};

function StatCard({ label, value, sub, color = '#60a5fa', icon }: {
  label: string; value: string | number; sub?: string; color?: string; icon: React.ReactNode;
}) {
  return (
    <div style={STAT_CARD}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', margin: 0 }}>
          {label}
        </p>
        <div style={{ color, opacity: 0.7 }}>{icon}</div>
      </div>
      <p style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.04em', margin: '0 0 4px', lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>{sub}</p>}
    </div>
  );
}

export default async function StudioDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id, display_name, total_clients, total_transformations, avg_client_rating, specialty')
    .eq('user_id', user.id).maybeSingle();
  if (!creator) redirect('/apply');

  const [programsRes, rosterRes, communityRes] = await Promise.all([
    supabase.from('programs').select('id, title, type, is_published, enrollment_count, created_at').eq('creator_id', creator.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('client_roster').select('id, member_user_id, status, current_week, start_date, program_id').eq('creator_id', creator.id).order('created_at', { ascending: false }).limit(8),
    supabase.from('creator_communities').select('member_count, post_count').eq('creator_id', creator.id).maybeSingle(),
  ]);

  const programs = programsRes.data ?? [];
  const roster = rosterRes.data ?? [];
  const community = communityRes.data;

  const activeClients = roster.filter(r => r.status === 'active').length;
  const publishedPrograms = programs.filter(p => p.is_published).length;

  const typeColor = (t: string) =>
    t === 'challenge' ? '#fbbf24' : t === 'one_on_one' ? '#60a5fa' : '#4ade80';

  const typeLabel = (t: string) =>
    t === 'one_on_one' ? '1-on-1' : t === 'challenge' ? 'Challenge' : 'Program';

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', margin: '0 0 2px' }}>
            Welcome back, {creator.display_name.split(' ')[0]}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            Here's what's happening with your coaching business
          </p>
        </div>
        <Link href="/studio/programs/new" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
          background: '#60a5fa', color: '#0a0c0f', textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(96,165,250,0.25)',
        }}>
          <Plus size={14} />
          New Program
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard label="Active Clients" value={activeClients} sub={`${roster.length} total on roster`} icon={<Users size={16} />} />
        <StatCard label="Programs" value={publishedPrograms} sub={`${programs.length} total created`} color="#4ade80" icon={<Dumbbell size={16} />} />
        <StatCard label="Community" value={community?.member_count ?? 0} sub={`${community?.post_count ?? 0} posts`} color="#fbbf24" icon={<Activity size={16} />} />
        <StatCard label="Avg Rating" value={creator.avg_client_rating ? creator.avg_client_rating.toFixed(1) : '–'} sub="from client reviews" color="#f472b6" icon={<Star size={16} />} />
      </div>

      {/* Two-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>

        {/* Programs */}
        <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Your Programs</p>
            <Link href="/studio/programs" style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {programs.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 14px' }}>No programs yet.</p>
              <Link href="/studio/programs/new" style={{
                fontSize: 12, fontWeight: 700, color: '#60a5fa',
                border: '1px solid rgba(96,165,250,0.3)', padding: '7px 14px', borderRadius: 8,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Plus size={12} /> Create your first program
              </Link>
            </div>
          ) : (
            <div>
              {programs.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 20px',
                  borderBottom: i < programs.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: `${typeColor(p.type)}14`,
                    border: `1px solid ${typeColor(p.type)}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Dumbbell size={14} style={{ color: typeColor(p.type) }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 10, color: typeColor(p.type), fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
                        {typeLabel(p.type)}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>·</span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{p.enrollment_count} enrolled</span>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 5,
                    background: p.is_published ? 'rgba(74,222,128,0.1)' : 'var(--color-surface-elevated)',
                    color: p.is_published ? '#4ade80' : 'var(--color-text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)',
                  }}>
                    {p.is_published ? 'Live' : 'Draft'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clients */}
        <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Recent Clients</p>
            <Link href="/studio/clients" style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              Manage <ArrowRight size={11} />
            </Link>
          </div>
          {roster.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 14px' }}>No clients yet.</p>
              <Link href="/studio/clients" style={{
                fontSize: 12, fontWeight: 700, color: '#60a5fa',
                border: '1px solid rgba(96,165,250,0.3)', padding: '7px 14px', borderRadius: 8,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Plus size={12} /> Add your first client
              </Link>
            </div>
          ) : (
            <div>
              {roster.slice(0, 6).map((r, i) => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                  borderBottom: i < Math.min(roster.length, 6) - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(96,165,250,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#60a5fa',
                  }}>
                    {r.member_user_id.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                      Client · Week {r.current_week}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
                      Since {new Date(r.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 5, textTransform: 'uppercase',
                    letterSpacing: '0.06em', fontFamily: 'var(--font-mono)',
                    background: r.status === 'active' ? 'rgba(74,222,128,0.1)' : 'var(--color-surface-elevated)',
                    color: r.status === 'active' ? '#4ade80' : 'var(--color-text-muted)',
                  }}>
                    {r.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 18 }}>
        {[
          { label: 'Build a New Program', sub: 'Design week-by-week training', href: '/studio/programs/new', color: '#60a5fa' },
          { label: 'Add a Client', sub: 'Expand your roster', href: '/studio/clients', color: '#4ade80' },
          { label: 'View Public Profile', sub: 'See how members find you', href: `/studio`, color: '#fbbf24' },
        ].map(({ label, sub, href, color }) => (
          <Link key={label} href={href} style={{
            display: 'block', padding: '16px 18px',
            background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
            borderRadius: 12, textDecoration: 'none', transition: 'border-color 200ms ease',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 3px' }}>{label}</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>{sub}</p>
            <div style={{ width: 20, height: 2, borderRadius: 1, background: color, marginTop: 10 }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
