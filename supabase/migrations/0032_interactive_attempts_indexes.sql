-- Index for interactive_attempts by course and created_at
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='interactive_attempts') then
    create index if not exists idx_interactive_attempts_course_created on public.interactive_attempts(course_id, created_at desc);
  end if;
exception when others then
  raise notice 'interactive_attempts indexes migration skipped: %', sqlerrm;
end $$;


