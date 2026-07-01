import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UsersClient } from './UsersClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin — Users' };

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: caller } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single();
  if (!caller?.is_admin) redirect('/dashboard');

  const [profilesRes, subsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('user_id, name, username, avatar_url, is_admin, is_creator, onboarding_completed, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('user_id, status, expires_at')
      .eq('status', 'active'),
  ]);

  const activeSubs = new Set(
    (subsRes.data ?? [])
      .filter(s => s.expires_at && new Date(s.expires_at) > new Date())
      .map(s => s.user_id),
  );

  const users = (profilesRes.data ?? []).map(p => ({
    ...p,
    isPro: activeSubs.has(p.user_id),
  }));

  const totalPro = users.filter(u => u.isPro).length;
  const totalCreators = users.filter(u => u.is_creator).length;
  const totalIncomplete = users.filter(u => !u.onboarding_completed).length;

  const stats = [
    { label: 'Total users', value: users.length },
    { label: 'Pro', value: totalPro },
    { label: 'Creators', value: totalCreators },
    { label: 'Incomplete onboarding', value: totalIncomplete },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Users</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Manage user accounts and admin permissions</p>
      </div>

      <div className="flex-1 px-8 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ label, value }) => (
            <div key={label} className="rounded-xl p-4 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        <UsersClient users={users} currentUserId={user.id} />
      </div>
    </div>
  );
}
