-- Helpful indexes for announcements queries
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='announcements') then
    create index if not exists idx_announcements_course_created on public.announcements(course_id, created_at desc);
    create index if not exists idx_announcements_publish_at on public.announcements(publish_at);
  end if;
exception when others then
  raise notice 'announcements indexes migration skipped: %', sqlerrm;
end $$;


