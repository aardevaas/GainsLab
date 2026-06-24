import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Plus, Dumbbell, Users } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Programs' };

const TYPE_COLOR: Record<string, string> = {
  challenge: '#fbbf24',
  one_on_one: '#60a5fa',
  standard: '#4ade80',
};

const TYPE_LABEL: Record<string, string> = {
  challenge: 'Challenge',
  one_on_one: '1-on-1',
  standard: 'Program',
};

const GOAL_LABEL: Record<string, string> = {
  fat_loss: 'Fat Loss',
  muscle_gain: 'Muscle Gain',
  maintenance: 'Maintenance',
  performance: 'Performance',
  general: 'General',
};

export default async function ProgramsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: creator } = await supabase
    .from('creator_profiles').select('id').eq('user_id', user.id).maybeSingle();
  if (!creator) redirect('/apply');

  const { data: programs } = await supabase
    .from('programs')
    .select('id, title, description, type, goal, duration_weeks, price_bob, is_free, is_published, enrollment_count, created_at')
    .eq('creator_id', creator.id)
    .order('created_at', { ascending: false });

  const list = programs ?? [];
  const published = list.filter(p => p.is_published).length;
  const drafts = list.filter(p => !p.is_published).length;

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', margin: '0 0 2px' }}>
            Programs
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            {published} live · {drafts} draft{drafts !== 1 ? 's' : ''}
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

      {list.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 340, textAlign: 'center', gap: 16,
          border: '1px dashed var(--color-border)', borderRadius: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: 'rgba(96,165,250,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Dumbbell size={22} style={{ color: '#60a5fa' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 6px' }}>
              Create your first program
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, maxWidth: 320 }}>
              Design week-by-week training plans your clients follow on their dashboard.
            </p>
          </div>
          <Link href="/studio/programs/new" style={{
            padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: '#60a5fa', color: '#0a0c0f', textDecoration: 'none',
          }}>
            Build a Program
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {list.map(p => {
            const color = TYPE_COLOR[p.type] ?? '#60a5fa';
            return (
              <div key={p.id} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 14, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
              }}>
                {/* Color stripe */}
                <div style={{ height: 4, background: color, opacity: 0.7 }} />
                <div style={{ padding: '18px 20px 16px', flex: 1 }}>
                  {/* Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                      color, background: `${color}14`, padding: '2px 7px', borderRadius: 4,
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {TYPE_LABEL[p.type]}
                    </span>
                    {p.goal && (
                      <span style={{
                        fontSize: 10, color: 'var(--color-text-muted)',
                        background: 'var(--color-surface-elevated)', padding: '2px 7px', borderRadius: 4,
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {GOAL_LABEL[p.goal]}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 6px', lineHeight: 1.3 }}>
                    {p.title}
                  </h3>
                  {p.description && (
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 12px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {p.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Dumbbell size={11} /> {p.duration_weeks}w
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={11} /> {p.enrollment_count}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {p.is_free ? 'Free' : `Bs. ${p.price_bob}`}
                    </span>
                  </div>
                </div>
                {/* Footer */}
                <div style={{
                  padding: '10px 20px', borderTop: '1px solid var(--color-border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.06em', fontFamily: 'var(--font-mono)',
                    color: p.is_published ? '#4ade80' : 'var(--color-text-muted)',
                  }}>
                    {p.is_published ? '● Live' : '○ Draft'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
