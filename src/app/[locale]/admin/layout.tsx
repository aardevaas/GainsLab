import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminNav } from './AdminNav';
import type { ReactNode } from 'react';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();

  if (!profile?.is_admin) redirect('/dashboard');

  const [{ count: pendingPayments }, { count: pendingCreators }] = await Promise.all([
    supabase
      .from('payment_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('creator_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded-md" style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}>
              ADMIN
            </span>
            <span className="font-bold" style={{ color: 'var(--color-text)' }}>GainsLab Admin</span>
          </div>
          <a href="/dashboard" className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            ← Back to app
          </a>
        </div>
        <AdminNav
          pendingPayments={pendingPayments ?? 0}
          pendingCreators={pendingCreators ?? 0}
        />
      </div>
      <div className="px-8 py-6">{children}</div>
    </div>
  );
}
