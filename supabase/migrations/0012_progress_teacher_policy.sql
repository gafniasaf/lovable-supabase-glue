-- Allow teachers to select progress for lessons in their own courses
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'progress' and polname = 'progress_select_teacher'
  ) then
    create policy progress_select_teacher on public.progress
    for select to authenticated
    using (
      exists (
        select 1 from public.lessons l join public.courses c on c.id = l.course_id
        where l.id = progress.lesson_id and c.teacher_id = auth.uid()
      )
    );
  end if;
end $$;


