-- Usage counters table for provider/course/day aggregates
create table if not exists public.usage_counters (
  day date not null,
  provider_id uuid null,
  course_id uuid null,
  metric text not null,
  count bigint not null default 0,
  storage_bytes bigint not null default 0,
  compute_minutes bigint not null default 0,
  primary key(day, provider_id, course_id, metric)
);

alter table public.usage_counters enable row level security;

-- Admin-only access
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'usage_counters_admin_select') then
    create policy usage_counters_admin_select on public.usage_counters
      for select to authenticated
      using ( exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );
  end if;
  if not exists (select 1 from pg_policies where polname = 'usage_counters_admin_modify') then
    create policy usage_counters_admin_modify on public.usage_counters
      for all to authenticated
      using ( exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') )
      with check ( exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );
  end if;
end $$;

create index if not exists idx_usage_counters_metric on public.usage_counters(metric);
create index if not exists idx_usage_counters_provider on public.usage_counters(provider_id);
create index if not exists idx_usage_counters_course on public.usage_counters(course_id);


