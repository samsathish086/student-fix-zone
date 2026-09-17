-- Roles
create type public.app_role as enum ('student','staff','host');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "host reads roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(),'host'));
create policy "host manages roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'host')) with check (public.has_role(auth.uid(),'host'));

-- Profiles
create table public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  requested_role public.app_role not null default 'student',
  staff_id_number text,
  staff_id_path text,
  department text,
  status text not null default 'approved', -- pending | approved | rejected (staff only)
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "host reads profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'host'));
create policy "staff reads profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'staff'));
create policy "insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "host updates profiles" on public.profiles for update to authenticated using (public.has_role(auth.uid(),'host')) with check (public.has_role(auth.uid(),'host'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  req public.app_role := coalesce((new.raw_user_meta_data->>'requested_role')::public.app_role, 'student');
begin
  insert into public.profiles (id, email, full_name, requested_role, staff_id_number, department, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    req,
    new.raw_user_meta_data->>'staff_id_number',
    new.raw_user_meta_data->>'department',
    case when req = 'staff' then 'pending' else 'approved' end
  ) on conflict (id) do nothing;

  if req <> 'staff' then
    insert into public.user_roles (user_id, role) values (new.id, 'student') on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Reports
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category text not null,
  title text not null,
  description text not null,
  location text,
  latitude double precision,
  longitude double precision,
  photo_url text,
  is_ragging boolean not null default false,
  anonymous boolean not null default false,
  status text not null default 'submitted', -- submitted | in_progress | resolved | rejected
  response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;

create policy "own reports" on public.reports for select to authenticated using (auth.uid() = user_id);
create policy "public reports visible" on public.reports for select to authenticated using (is_ragging = false);
create policy "ragging visible to host" on public.reports for select to authenticated using (public.has_role(auth.uid(),'host'));
create policy "insert own report" on public.reports for insert to authenticated with check (auth.uid() = user_id);
create policy "host updates reports" on public.reports for update to authenticated using (public.has_role(auth.uid(),'host')) with check (public.has_role(auth.uid(),'host'));
create policy "host deletes reports" on public.reports for delete to authenticated using (public.has_role(auth.uid(),'host'));

-- Upvotes
create table public.report_upvotes (
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);
grant select, insert, delete on public.report_upvotes to authenticated;
grant all on public.report_upvotes to service_role;
alter table public.report_upvotes enable row level security;

create policy "read upvotes" on public.report_upvotes for select to authenticated using (true);
create policy "add own upvote" on public.report_upvotes for insert to authenticated with check (auth.uid() = user_id);
create policy "remove own upvote" on public.report_upvotes for delete to authenticated using (auth.uid() = user_id);
