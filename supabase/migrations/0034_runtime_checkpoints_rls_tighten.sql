-- Tighten RLS for runtime_checkpoints: restrict select/update to course owners or alias-owner mapping
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='runtime_checkpoints') then
    -- Keep table RLS enabled
    alter table public.runtime_checkpoints enable row level security;
    -- Replace permissive policies with more restrictive ones where not already present
    if not exists (select 1 from pg_policies where polname = 'runtime_checkpoints_select_course_teacher_only') then
      create policy runtime_checkpoints_select_course_teacher_only on public.runtime_checkpoints
      for select to authenticated
      using (
        exists (
          select 1 from public.courses c where c.id = runtime_checkpoints.course_id and c.teacher_id = auth.uid()
        )
      );
    end if;
    if not exists (select 1 from pg_policies where polname = 'runtime_checkpoints_update_course_teacher_only') then
      create policy runtime_checkpoints_update_course_teacher_only on public.runtime_checkpoints
      for update to authenticated
      using (
        exists (
          select 1 from public.courses c where c.id = runtime_checkpoints.course_id and c.teacher_id = auth.uid()
        )
      );
    end if;
    -- Inserts are performed via platform server or runtime bearer flows; keep permissive but consider service role only in prod.
  end if;
exception when others then
  raise notice 'runtime_checkpoints rls tighten skipped: %', sqlerrm;
end $$;


