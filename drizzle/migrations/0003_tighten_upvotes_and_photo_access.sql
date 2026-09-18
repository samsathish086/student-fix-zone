-- 1. Upvotes: only own rows readable; counts exposed via a safe function
drop policy if exists "read upvotes" on public.report_upvotes;

create policy "read own upvotes"
on public.report_upvotes
for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.report_vote_counts()
returns table (report_id uuid, votes bigint)
language sql
stable
security definer
set search_path = public
as $$
  select u.report_id, count(*)::bigint as votes
  from public.report_upvotes u
  group by u.report_id
$$;

grant execute on function public.report_vote_counts() to authenticated;

-- 2. Report photos: bind reads to the uploader, plus staff/host oversight
drop policy if exists "read report photos" on storage.objects;

create policy "read own report photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'report-photos'
  and (
    owner_id = (select auth.uid()::text)
    or (storage.foldername(name))[1] = (select auth.uid()::text)
    or public.has_role(auth.uid(), 'staff')
    or public.has_role(auth.uid(), 'host')
  )
);