'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createNotification } from '@/lib/notifications';
import { isVerifiedTier, TIER_LABELS, type VerificationTier } from '@/lib/creators/tiers';

function generateSlug(fullName: string): string {
  return fullName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function approveCreator(applicationId: string, reviewNote?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: app } = await supabase
    .from('creator_applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (!app) return { error: 'Application not found' };

  const baseSlug = generateSlug(app.full_name);

  // Ensure slug uniqueness
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const { data: existing } = await supabase
      .from('creator_profiles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const { error: profileError } = await supabase
    .from('creator_profiles')
    .insert({
      user_id: app.user_id,
      display_name: app.full_name,
      slug,
      bio: app.bio ?? null,
      avatar_url: null,
      cover_url: null,
      specialty: app.specialty,
      country: null,
      city: null,
      languages: ['es', 'en'],
      instagram_url: app.instagram_url ?? null,
      youtube_url: app.youtube_url ?? null,
      tiktok_url: app.tiktok_url ?? null,
      website_url: null,
      certifications: app.certifications ?? null,
      experience_years: app.experience_years ?? null,
      community_price_bob: null,
      avg_client_rating: null,
      is_verified: true,
      verification_tier: 'verified',
    });

  if (profileError && profileError.code !== '23505') {
    return { error: profileError.message };
  }

  await Promise.all([
    supabase
      .from('creator_applications')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_note: reviewNote ?? null,
      })
      .eq('id', applicationId),
    supabase
      .from('profiles')
      .update({ is_creator: true })
      .eq('user_id', app.user_id),
  ]);

  await createNotification({
    userId: app.user_id,
    type: 'creator_approved',
    title: 'Your creator application was approved!',
    body: 'You are now a verified GainsLab creator. Head to your Studio to finish setting up your profile and programs.',
    href: '/studio',
  });

  revalidatePath('/admin/creators');
  return { ok: true };
}

export async function rejectCreator(applicationId: string, reviewNote: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('creator_applications')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_note: reviewNote || null,
    })
    .eq('id', applicationId);

  if (error) return { error: error.message };

  const { data: rejectedApp } = await supabase
    .from('creator_applications')
    .select('user_id')
    .eq('id', applicationId)
    .single();

  if (rejectedApp) {
    await createNotification({
      userId: rejectedApp.user_id,
      type: 'creator_rejected',
      title: 'Creator application update',
      body: reviewNote
        ? `Your application wasn't approved: ${reviewNote}`
        : 'Your creator application wasn\'t approved at this time. You\'re welcome to reapply.',
      href: '/apply',
    });
  }

  revalidatePath('/admin/creators');
  return { ok: true };
}

export async function setCreatorTier(creatorId: string, tier: VerificationTier) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('user_id', user.id).single();
  if (!profile?.is_admin) return { error: 'Unauthorized' };

  const { data: creator, error } = await supabase
    .from('creator_profiles')
    .update({
      verification_tier: tier,
      // is_verified stays a plain derived flag — every other read site in the
      // app (discover, profile badges) still gates on it, not the tier.
      is_verified: isVerifiedTier(tier),
    })
    .eq('id', creatorId)
    .select('user_id, display_name')
    .single();

  if (error || !creator) return { error: error?.message ?? 'Creator not found' };

  await createNotification({
    userId: creator.user_id,
    type: 'verification_tier_changed',
    title: tier === 'none' ? 'Verification status updated' : `You're now ${TIER_LABELS[tier]}!`,
    body: tier === 'none'
      ? 'Your verification status has changed. Contact support if you have questions.'
      : `Your profile now shows the ${TIER_LABELS[tier]} badge.`,
    href: '/studio/settings',
  });

  revalidatePath('/admin/creators');
  revalidatePath(`/creator/${creator.display_name}`);
  revalidatePath('/discover');
  return { ok: true };
}
