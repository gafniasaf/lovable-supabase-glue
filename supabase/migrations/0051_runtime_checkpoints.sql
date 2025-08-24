-- Runtime checkpoints table for provider resume support
create table if not exists public.runtime_checkpoints (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null,
  alias text not null,
  key text not null,
  state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Uniqueness per course/alias/key
create unique index if not exists uq_runtime_checkpoints_course_alias_key on public.runtime_checkpoints(course_id, alias, key);

alter table public.runtime_checkpoints enable row level security;

-- Policies: by default, restrict reads/writes; server (service role) bypasses RLS
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'runtime_checkpoints_select_teacher') then
    create policy runtime_checkpoints_select_teacher on public.runtime_checkpoints
      for select to authenticated
      using (
        exists (
          select 1 from public.courses c
          where c.id = runtime_checkpoints.course_id and c.teacher_id = auth.uid()
        )
      );
  end if;
  if not exists (select 1 from pg_policies where polname = 'runtime_checkpoints_no_modify') then
    create policy runtime_checkpoints_no_modify on public.runtime_checkpoints
      for all to authenticated
      using (false)
      with check (false);
  end if;
end $$;


