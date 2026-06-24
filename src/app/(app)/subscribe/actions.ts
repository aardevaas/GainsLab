'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { extractReceiptData } from '@/lib/payments/ocr';
import { activateSubscription } from '@/lib/payments/subscription';

const PLAN_PRICE_BOB = parseFloat(process.env.PLAN_PRICE_BOB ?? '99.60');
const PRICE_TOLERANCE = 1.5; // allow ±1.50 BOB rounding difference

export type SubmitResult = {
  success: boolean;
  message: string;
  status?: 'approved' | 'pending' | 'rejected';
};

export async function submitReceipt(_prev: SubmitResult | null, formData: FormData): Promise<SubmitResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Not authenticated.' };

  // Block if they already have an active subscription
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('status, expires_at')
    .eq('user_id', user.id)
    .single();

  if (existingSub?.status === 'active' && existingSub.expires_at) {
    const days = Math.ceil((new Date(existingSub.expires_at).getTime() - Date.now()) / 86_400_000);
    return { success: false, message: `You already have an active subscription (${days} days remaining).` };
  }

  // Block if they have a pending submission already
  const { data: pending } = await supabase
    .from('payment_submissions')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle();

  if (pending) {
    return { success: false, message: 'You already have a receipt under review. We\'ll notify you within a few hours.' };
  }

  const file = formData.get('receipt') as File | null;
  if (!file || file.size === 0) return { success: false, message: 'Please select a receipt file.' };
  if (file.size > 10 * 1024 * 1024) return { success: false, message: 'File too large. Maximum 10 MB.' };

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowed.includes(file.type)) {
    return { success: false, message: 'Upload a JPG, PNG, WEBP, or PDF file.' };
  }

  // Upload receipt to private storage
  const ext = file.name.split('.').pop() ?? 'jpg';
  const storagePath = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from('payment-receipts')
    .upload(storagePath, file, { contentType: file.type });

  if (uploadErr) return { success: false, message: 'Upload failed. Please try again.' };

  // Run Claude Vision OCR
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const ocr = await extractReceiptData(base64, file.type);

  // Validate extracted fields
  const today = new Date().toISOString().split('T')[0];
  const amountOk = ocr.amount_bob !== null && Math.abs(ocr.amount_bob - PLAN_PRICE_BOB) <= PRICE_TOLERANCE;
  const dateOk = ocr.payment_date === today;
  const txOk = ocr.transaction_id !== null && ocr.transaction_id.trim().length >= 4;

  // Guard against reused receipts
  if (txOk) {
    const { data: usedTx } = await supabase
      .from('verified_tx_ids')
      .select('transaction_id')
      .eq('transaction_id', ocr.transaction_id!)
      .maybeSingle();

    if (usedTx) {
      await supabase.storage.from('payment-receipts').remove([storagePath]);
      return { success: false, message: 'This receipt has already been used for a previous payment.' };
    }
  }

  const autoApprove = amountOk && dateOk && txOk && ocr.confidence === 'high';
  const status = autoApprove ? 'approved' : 'pending';

  const { data: submission } = await supabase
    .from('payment_submissions')
    .insert({
      user_id: user.id,
      receipt_storage_path: storagePath,
      plan_id: 'pro',
      status,
      amount_extracted: ocr.amount_bob,
      transaction_id_extracted: ocr.transaction_id,
      date_extracted: ocr.payment_date,
      destination_extracted: ocr.destination_account,
      ocr_raw: ocr,
      ocr_confidence: ocr.confidence,
      auto_approved: autoApprove,
    })
    .select('id')
    .single();

  if (autoApprove && submission) {
    if (ocr.transaction_id) {
      await supabase.from('verified_tx_ids').insert({
        transaction_id: ocr.transaction_id,
        submission_id: submission.id,
        user_id: user.id,
      });
    }
    await activateSubscription(user.id, 'pro');
    revalidatePath('/subscribe');
    return { success: true, message: 'Payment verified instantly! Your Pro subscription is now active.', status: 'approved' };
  }

  revalidatePath('/subscribe');
  return {
    success: true,
    message: 'Receipt submitted! We\'ll review it within a few hours and activate your access.',
    status: 'pending',
  };
}
