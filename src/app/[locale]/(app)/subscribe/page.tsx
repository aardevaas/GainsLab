import Link from 'next/link';
import { ArrowLeft, Check, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getSubscriptionStatus } from '@/lib/payments/subscription';
import { SubscribeClient } from './SubscribeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Subscribe — GainsLab Pro' };

const PRO_FEATURES = [
  'Unlimited food & workout logging',
  'Calorie Dashboard with 90-day projections',
  'Body Composition Timeline',
  'AI Meal Planner & Recipe Browser',
  'Community leaderboards & competitions',
  'Body Age Score assessment',
  'Share card with Gains Score',
];

export default async function SubscribePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [sub, pendingRes] = await Promise.all([
    getSubscriptionStatus(user.id),
    supabase
      .from('payment_submissions')
      .select('id, submitted_at')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .maybeSingle(),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link
          href="/dashboard"
          className="size-8 rounded-lg flex items-center justify-center border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            GainsLab Pro
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Bs. {process.env.NEXT_PUBLIC_PLAN_PRICE_BOB ?? '99.60'} / month · cancel anytime
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-2xl space-y-6">
        {/* Active subscription state */}
        {sub.isActive ? (
          <div className="rounded-2xl border p-6 space-y-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-accent)' }}>
            <div className="flex items-center gap-3">
              <Star size={18} style={{ color: 'var(--color-accent)' }} />
              <p className="font-bold" style={{ color: 'var(--color-text)' }}>Pro — Active</p>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {sub.daysRemaining} days remaining · expires{' '}
              {new Date(sub.expiresAt!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-elevated)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  background: 'var(--color-accent)',
                  width: `${Math.min(100, ((sub.daysRemaining ?? 0) / 30) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              To renew, submit a new receipt 1–2 days before expiry.
            </p>
          </div>
        ) : (
          <>
            {/* Feature list */}
            <div className="rounded-2xl border p-6" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Everything in Pro
              </p>
              <ul className="space-y-2.5">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <Check size={14} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment flow */}
            <SubscribeClient
              hasPending={!!pendingRes.data}
              pendingSubmittedAt={pendingRes.data?.submitted_at ?? null}
            />
          </>
        )}
      </div>
    </div>
  );
}
