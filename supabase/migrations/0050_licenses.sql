-- Licenses table for governance (seat enforcement)
create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null,
  tenant_id uuid null,
  external_course_id uuid null,
  seats_total int not null default 0,
  seats_used int not null default 0,
  expires_at timestamptz null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.licenses enable row level security;

-- Admin-only access
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'licenses_admin_select') then
    create policy licenses_admin_select on public.licenses
      for select to authenticated
      using ( exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );
  end if;
  if not exists (select 1 from pg_policies where polname = 'licenses_admin_modify') then
    create policy licenses_admin_modify on public.licenses
      for all to authenticated
      using ( exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') )
      with check ( exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );
  end if;
end $$;

create index if not exists idx_licenses_provider on public.licenses(provider_id);
create index if not exists idx_licenses_course on public.licenses(external_course_id);


