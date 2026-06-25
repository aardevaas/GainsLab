import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CheckinFormClient } from './CheckinFormClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Weekly Check-in' };

type Question = { id: string; question: string; type: string };

export default async function CheckinPage(
  { params }: { params: Promise<{ checkinId: string }> }
) {
  const { checkinId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: checkin } = await supabase
    .from('automated_checkins')
    .select('id, title, questions, is_active')
    .eq('id', checkinId)
    .single();

  if (!checkin || !checkin.is_active) redirect('/my-program');

  const questions = (checkin.questions as Question[]) ?? [];

  return (
    <div style={{ padding: '32px 28px' }}>
      <CheckinFormClient
        checkinId={checkin.id}
        title={checkin.title}
        questions={questions}
      />
    </div>
  );
}
