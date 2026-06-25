import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CheckinBuilderClient } from './CheckinBuilderClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'New Check-in — Studio' };

export default async function NewCheckinPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect('/studio');

  const { data: programs } = await supabase
    .from('programs')
    .select('id, title')
    .eq('creator_id', profile.id)
    .order('title');

  return (
    <div style={{ padding: '32px 28px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 20, fontWeight: 800, color: 'var(--color-text)',
          margin: '0 0 4px', letterSpacing: '-0.03em',
        }}>
          New Check-in
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
          Build a recurring questionnaire for your clients.
        </p>
      </div>

      <CheckinBuilderClient programs={programs ?? []} />
    </div>
  );
}
