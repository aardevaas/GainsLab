insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-avatars', 'user-avatars', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "user_upload_avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'user-avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "user_avatar_public_read"
  on storage.objects for select
  using (bucket_id = 'user-avatars');

create policy "user_delete_avatar"
  on storage.objects for delete
  using (
    bucket_id = 'user-avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
