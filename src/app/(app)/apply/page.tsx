import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ApplyClient } from './ApplyClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Apply as Creator' };

const STATUS_UI: Record<string, { icon: React.ReactNode; color: string; title: string; body: string }> = {
  pending: {
    icon: <Clock size={28} />,
    color: '#fbbf24',
    title: 'Application Under Review',
    body: 'We received your application and are reviewing it personally. Expect a response within 48 hours.',
  },
  approved: {
    icon: <CheckCircle size={28} />,
    color: '#4ade80',
    title: 'You\'re a Creator!',
    body: 'Your application was approved. Head to the Creator Studio to build your first program.',
  },
  rejected: {
    icon: <XCircle size={28} />,
    color: '#f87171',
    title: 'Application Not Approved',
    body: 'This round wasn\'t the right fit, but the platform is evolving. Reach out if you think this was in error.',
  },
};

export default async function ApplyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Already a creator — redirect to studio
  const { data: creatorProfile } = await supabase
    .from('creator_profiles').select('id').eq('user_id', user.id).maybeSingle();
  if (creatorProfile) redirect('/studio');

  // Check existing application
  const { data: application } = await supabase
    .from('creator_applications').select('status, submitted_at').eq('user_id', user.id).maybeSingle();

  const { data: profile } = await supabase
    .from('profiles').select('name').eq('user_id', user.id).single();

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-8 py-5 border-b flex items-center gap-4 shrink-0"
        style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link href="/dashboard"
          className="size-8 rounded-lg flex items-center justify-center border"
          style={{ borderColor: 'var(--color-border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Become a Creator
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Apply to build, sell, and scale your coaching on GainsLab
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8">
        {/* Existing application status */}
        {application ? (
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
              textAlign: 'center', padding: '60px 40px',
              background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
              borderRadius: 18,
            }}>
              {(() => {
                const ui = STATUS_UI[application.status] ?? STATUS_UI.pending;
                return (
                  <>
                    <div style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: `${ui.color}14`, border: `2px solid ${ui.color}50`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: ui.color,
                    }}>
                      {ui.icon}
                    </div>
                    <div>
                      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                        {ui.title}
                      </h2>
                      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>
                        {ui.body}
                      </p>
                    </div>
                    {application.status === 'approved' && (
                      <Link href="/studio" style={{
                        padding: '11px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                        background: 'var(--color-accent)', color: '#0a0c0f',
                      }}>
                        Go to Creator Studio →
                      </Link>
                    )}
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      Submitted {new Date(application.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <ApplyClient profileName={profile?.name ?? null} />
        )}
      </div>
    </div>
  );
}
