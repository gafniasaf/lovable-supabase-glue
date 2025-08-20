-- Audit logs for admin actions and grading

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

-- Minimal policy: allow authenticated insert; reads gated via app-layer admin checks
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'audit_logs_insert_any_auth') then
    create policy audit_logs_insert_any_auth on public.audit_logs for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where polname = 'audit_logs_select_none') then
    create policy audit_logs_select_none on public.audit_logs for select to authenticated using (false);
  end if;
end $$;


