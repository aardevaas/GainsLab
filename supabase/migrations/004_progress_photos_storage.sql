-- ─────────────────────────────────────────
-- PROGRESS PHOTOS — Supabase Storage bucket + RLS
-- ─────────────────────────────────────────
-- Run this in the Supabase SQL Editor.

-- 1. Create the private bucket (idempotent)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'progress-photos',
  'progress-photos',
  false,
  10485760,           -- 10 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

-- 2. Users can upload to their own sub-folder: {user_id}/...
create policy "progress_photos_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'progress-photos'
  and (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- 3. Users can read their own photos (signed URLs will verify this)
create policy "progress_photos_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'progress-photos'
  and (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- 4. Users can delete their own photos
create policy "progress_photos_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'progress-photos'
  and (string_to_array(name, '/'))[1] = auth.uid()::text
);
