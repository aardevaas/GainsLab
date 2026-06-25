'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { activateSubscription } from '@/lib/payments/subscription';
import { createNotification } from '@/lib/notifications';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();

  if (!profile?.is_admin) throw new Error('Not authorized');
  return { supabase, adminId: user.id };
}

export async function approveSubmission(submissionId: string, note?: string): Promise<void> {
  const { supabase, adminId } = await requireAdmin();

  const { data: submission } = await supabase
    .from('payment_submissions')
    .select('user_id, plan_id, transaction_id_extracted')
    .eq('id', submissionId)
    .single();

  if (!submission) throw new Error('Submission not found');

  await supabase
    .from('payment_submissions')
    .update({
      status: 'approved',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      review_note: note ?? null,
    })
    .eq('id', submissionId);

  if (submission.transaction_id_extracted) {
    await supabase.from('verified_tx_ids').upsert({
      transaction_id: submission.transaction_id_extracted,
      submission_id: submissionId,
      user_id: submission.user_id,
    });
  }

  await activateSubscription(submission.user_id, submission.plan_id);

  await createNotification({
    userId: submission.user_id,
    type: 'payment_approved',
    title: 'Payment approved — you\'re Pro!',
    body: 'Your subscription is now active. Enjoy full access to GainsLab Pro.',
    href: '/dashboard',
  });

  revalidatePath('/admin/payments');
}

export async function rejectSubmission(submissionId: string, note: string): Promise<void> {
  const { supabase, adminId } = await requireAdmin();

  const { data: submission } = await supabase
    .from('payment_submissions')
    .select('user_id')
    .eq('id', submissionId)
    .single();

  await supabase
    .from('payment_submissions')
    .update({
      status: 'rejected',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      review_note: note || 'Receipt could not be verified.',
    })
    .eq('id', submissionId);

  if (submission) {
    await createNotification({
      userId: submission.user_id,
      type: 'payment_rejected',
      title: 'Payment could not be verified',
      body: note || 'Your receipt could not be verified. Please resubmit with a clear screenshot of the transfer.',
      href: '/subscribe',
    });
  }

  revalidatePath('/admin/payments');
}

export async function flagSubmission(submissionId: string, note: string): Promise<void> {
  const { supabase, adminId } = await requireAdmin();

  await supabase
    .from('payment_submissions')
    .update({
      status: 'flagged',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      review_note: note || 'Flagged for further review.',
    })
    .eq('id', submissionId);

  revalidatePath('/admin/payments');
}
