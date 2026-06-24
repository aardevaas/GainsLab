import { createClient } from '@/lib/supabase/server';

export type SubscriptionStatus = {
  isActive: boolean;
  plan: string | null;
  expiresAt: string | null;
  daysRemaining: number | null;
};

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('plan_id, status, expires_at')
    .eq('user_id', userId)
    .single();

  if (!data || data.status !== 'active' || !data.expires_at) {
    return { isActive: false, plan: null, expiresAt: null, daysRemaining: null };
  }

  const expiresAt = new Date(data.expires_at);
  const now = new Date();

  if (expiresAt <= now) {
    await supabase
      .from('subscriptions')
      .update({ status: 'expired', updated_at: now.toISOString() })
      .eq('user_id', userId);
    return { isActive: false, plan: data.plan_id, expiresAt: data.expires_at, daysRemaining: 0 };
  }

  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / 86_400_000);
  return { isActive: true, plan: data.plan_id, expiresAt: data.expires_at!, daysRemaining };
}

export async function activateSubscription(userId: string, planId = 'pro'): Promise<void> {
  const supabase = await createClient();
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30);

  await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      plan_id: planId,
      status: 'active',
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      updated_at: now.toISOString(),
    },
    { onConflict: 'user_id' },
  );
}
