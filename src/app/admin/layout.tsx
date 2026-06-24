import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="border-b px-8 py-4 flex items-center justify-between" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
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
      <div className="px-8 py-6">{children}</div>
    </div>
  );
}
