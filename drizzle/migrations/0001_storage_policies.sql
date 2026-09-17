-- staff id cards: owner uploads/reads own, host reads all
create policy "staff upload own id" on storage.objects for insert to authenticated
  with check (bucket_id = 'staff-ids' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "staff read own id" on storage.objects for select to authenticated
  using (bucket_id = 'staff-ids' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "host reads staff ids" on storage.objects for select to authenticated
  using (bucket_id = 'staff-ids' and public.has_role(auth.uid(),'host'));

-- report photos: any signed-in user uploads to own folder, all signed-in users can read
create policy "upload own report photo" on storage.objects for insert to authenticated
  with check (bucket_id = 'report-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "read report photos" on storage.objects for select to authenticated
  using (bucket_id = 'report-photos');
