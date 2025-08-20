-- RLS policies for announcements: teachers of a course can write; enrolled students/parents can read
do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'announcements') then
    raise notice 'announcements table missing; skipping policies';
  else
    alter table public.announcements enable row level security;
    if not exists (select 1 from pg_policies where polname = 'announcements_select_enrolled_or_parent_or_teacher') then
      create policy announcements_select_enrolled_or_parent_or_teacher on public.announcements
      for select to authenticated
      using (
        exists (
          select 1 from public.courses c
          where c.id = announcements.course_id and (
            c.teacher_id = auth.uid() or
            exists (
              select 1 from public.enrollments e where e.course_id = announcements.course_id and e.student_id = auth.uid()
            ) or
            exists (
              select 1 from public.parent_links pl join public.enrollments e on e.student_id = pl.student_id
              where pl.parent_id = auth.uid() and e.course_id = announcements.course_id
            )
          )
        )
      );
    end if;
    if not exists (select 1 from pg_policies where polname = 'announcements_write_teacher_own_course') then
      create policy announcements_write_teacher_own_course on public.announcements
      for all to authenticated
      using (
        exists (
          select 1 from public.courses c where c.id = announcements.course_id and c.teacher_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.courses c where c.id = announcements.course_id and c.teacher_id = auth.uid()
        )
      );
    end if;
  end if;
end $$;


