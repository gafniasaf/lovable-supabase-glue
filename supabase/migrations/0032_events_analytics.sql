-- Basic analytics tables and indexes
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  event_type text not null,
  entity_type text not null,
  entity_id text not null,
  ts timestamptz not null default now(),
  meta jsonb not null default '{}'::jsonb
);

-- RLS: authenticated users can insert their own events; admins can read all; users can read their own (optional)
alter table public.events enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'events_insert_own') then
    create policy events_insert_own on public.events
      for insert to authenticated
      with check (auth.uid() is not null and (user_id is null or user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where polname = 'events_select_own') then
    create policy events_select_own on public.events
      for select to authenticated
      using (user_id is null or user_id = auth.uid());
  end if;
end $$;

create index if not exists idx_events_ts on public.events (ts desc);
create index if not exists idx_events_type on public.events (event_type);
create index if not exists idx_events_entity on public.events (entity_type, entity_id);

-- Daily aggregates (materialized view)
create materialized view if not exists public.daily_active_users as
select date_trunc('day', ts) as day, count(distinct user_id) as dau
from public.events
where user_id is not null
group by 1
order by 1 desc;

create index if not exists idx_dau_day on public.daily_active_users(day);

create or replace function public.refresh_daily_active_users() returns void as $$
begin
  refresh materialized view concurrently public.daily_active_users;
exception when others then
  begin
    refresh materialized view public.daily_active_users;
  exception when others then null; end;
end; $$ language plpgsql security definer;


