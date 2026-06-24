'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type PhotoRecord = {
  id: string;
  date: string;
  notes: string | null;
  is_public: boolean;
  url: string;           // raw storage path
  signedUrl: string;     // 1-hour signed URL for display
};

const BUCKET = 'progress-photos';
const SIGNED_EXPIRY = 3600; // 1 hour

export async function getPhotos(): Promise<PhotoRecord[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: rows } = await supabase
    .from('progress_photos')
    .select('id, date, notes, is_public, url')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (!rows?.length) return [];

  // Batch sign all URLs
  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(rows.map(r => r.url), SIGNED_EXPIRY);

  return rows.map((r, i) => ({
    ...r,
    signedUrl: signed?.[i]?.signedUrl ?? '',
  }));
}

export async function recordPhoto(input: {
  storagePath: string;
  date: string;
  notes: string | null;
}): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('progress_photos')
    .insert({ user_id: user.id, url: input.storagePath, date: input.date, notes: input.notes, is_public: false })
    .select('id')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/tracker/photos');
  return { id: data.id };
}

export async function deletePhoto(id: string, storagePath: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('progress_photos').delete().eq('id', id).eq('user_id', user.id);
  await supabase.storage.from(BUCKET).remove([storagePath]);
  revalidatePath('/tracker/photos');
}

export async function togglePublic(id: string, isPublic: boolean): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('progress_photos').update({ is_public: isPublic }).eq('id', id).eq('user_id', user.id);
  revalidatePath('/tracker/photos');
}
