-- Public bucket for creator profile photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'creator-avatars',
  'creator-avatars',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Authenticated users can upload into their own sub-folder: {user_id}/...
create policy "creator_upload_avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'creator-avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public read — avatars appear on discover page and creator profiles
create policy "creator_avatar_public_read"
  on storage.objects for select
  using (bucket_id = 'creator-avatars');

-- Creator can replace/delete their own avatar
create policy "creator_delete_avatar"
  on storage.objects for delete
  using (
    bucket_id = 'creator-avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
