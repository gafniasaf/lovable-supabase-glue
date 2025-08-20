-- Runtime checkpoints table for small JSON snapshots keyed by alias+course+key

create table if not exists public.runtime_checkpoints (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  alias text not null,
  key text not null,
  state jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(course_id, alias, key)
);

alter table public.runtime_checkpoints enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where polname = 'runtime_checkpoints_select_all') then
    create policy runtime_checkpoints_select_all on public.runtime_checkpoints for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where polname = 'runtime_checkpoints_upsert_server') then
    create policy runtime_checkpoints_upsert_server on public.runtime_checkpoints for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where polname = 'runtime_checkpoints_update_server') then
    create policy runtime_checkpoints_update_server on public.runtime_checkpoints for update to authenticated using (true);
  end if;
end $$;


