import { createClient } from '@/lib/supabase/server';
import { CreatorsClient } from './CreatorsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Creator Applications — Admin' };

export default async function AdminCreatorsPage() {
  const supabase = await createClient();

  const [{ data: applications }, { data: creators }] = await Promise.all([
    supabase
      .from('creator_applications')
      .select('id, user_id, full_name, bio, specialty, instagram_url, youtube_url, tiktok_url, experience_years, certifications, motivation, status, review_note, reviewed_at, submitted_at')
      .order('submitted_at', { ascending: false }),
    supabase
      .from('creator_profiles')
      .select('id, display_name, slug, avatar_url, verification_tier, total_clients, avg_client_rating, created_at')
      .order('created_at', { ascending: false }),
  ]);

  const pending  = (applications ?? []).filter(a => a.status === 'pending').length;
  const approved = (applications ?? []).filter(a => a.status === 'approved').length;
  const rejected = (applications ?? []).filter(a => a.status === 'rejected').length;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 800, color: 'var(--color-text)',
          margin: '0 0 4px', letterSpacing: '-0.03em',
        }}>
          Creator Applications
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
          {pending} pending · {approved} approved · {rejected} rejected
        </p>
      </div>

      <CreatorsClient applications={applications ?? []} creators={creators ?? []} />
    </div>
  );
}
