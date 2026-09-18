create table public.site_settings (
  id boolean primary key default true,
  site_title text not null default 'CampusFix',
  tagline text not null default 'Campus maintenance portal',
  logo_url text,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id)
);

grant select on public.site_settings to anon, authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "anyone reads site settings" on public.site_settings for select to anon, authenticated using (true);
create policy "host updates site settings" on public.site_settings for update to authenticated using (has_role(auth.uid(),'host')) with check (has_role(auth.uid(),'host'));
create policy "host inserts site settings" on public.site_settings for insert to authenticated with check (has_role(auth.uid(),'host'));

insert into public.site_settings (id) values (true);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_label text not null default 'staff',
  phone text not null,
  email text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

grant select on public.contacts to anon, authenticated;
grant insert, update, delete on public.contacts to authenticated;
grant all on public.contacts to service_role;
alter table public.contacts enable row level security;
create policy "anyone reads contacts" on public.contacts for select to anon, authenticated using (true);
create policy "host manages contacts" on public.contacts for all to authenticated using (has_role(auth.uid(),'host')) with check (has_role(auth.uid(),'host'));

insert into public.contacts (name, role_label, phone, email, sort_order) values
  ('Campus Host Office', 'host', '+91 98400 00000', 'host@campusfix.edu', 1),
  ('Maintenance Staff Desk', 'staff', '+91 98400 11111', 'maintenance@campusfix.edu', 2);