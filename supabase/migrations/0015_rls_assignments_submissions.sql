-- RLS hardening for assignments and submissions

do $$ begin
  -- Ensure tables exist
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'assignments') then
    raise notice 'assignments table missing; skipping policies';
  else
    alter table public.assignments enable row level security;

    -- Teachers can select assignments for their courses
    if not exists (select 1 from pg_policies where polname = 'assignments_select_teacher_course') then
      create policy assignments_select_teacher_course on public.assignments
      for select to authenticated
      using (exists (
        select 1 from public.courses c where c.id = assignments.course_id and c.teacher_id = auth.uid()
      ));
    end if;

    -- Students can select assignments for courses they are enrolled in
    if not exists (select 1 from pg_policies where polname = 'assignments_select_student_enrolled') then
      create policy assignments_select_student_enrolled on public.assignments
      for select to authenticated
      using (exists (
        select 1 from public.enrollments e where e.course_id = assignments.course_id and e.student_id = auth.uid()
      ));
    end if;

    -- Teachers can insert/update/delete assignments for their courses
    if not exists (select 1 from pg_policies where polname = 'assignments_write_teacher_own') then
      create policy assignments_write_teacher_own on public.assignments
      for all to authenticated
      using (exists (
        select 1 from public.courses c join public.profiles p on p.id = auth.uid() and p.role = 'teacher'
        where c.id = assignments.course_id and c.teacher_id = auth.uid()
      ))
      with check (exists (
        select 1 from public.courses c join public.profiles p on p.id = auth.uid() and p.role = 'teacher'
        where c.id = assignments.course_id and c.teacher_id = auth.uid()
      ));
    end if;
  end if;

  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'submissions') then
    raise notice 'submissions table missing; skipping policies';
  else
    alter table public.submissions enable row level security;

    -- Students can insert and select their own submissions
    if not exists (select 1 from pg_policies where polname = 'submissions_student_own') then
      create policy submissions_student_own on public.submissions
      for select to authenticated using (student_id = auth.uid());
      create policy submissions_student_insert on public.submissions
      for insert to authenticated with check (student_id = auth.uid());
    end if;

    -- Teachers can select submissions for assignments in their courses
    if not exists (select 1 from pg_policies where polname = 'submissions_select_teacher_course') then
      create policy submissions_select_teacher_course on public.submissions
      for select to authenticated
      using (exists (
        select 1 from public.assignments a join public.courses c on c.id = a.course_id
        where a.id = submissions.assignment_id and c.teacher_id = auth.uid()
      ));
    end if;

    -- Teachers can grade (update) submissions for their courses
    if not exists (select 1 from pg_policies where polname = 'submissions_update_grade_teacher') then
      create policy submissions_update_grade_teacher on public.submissions
      for update to authenticated
      using (exists (
        select 1 from public.assignments a join public.courses c on c.id = a.course_id
        where a.id = submissions.assignment_id and c.teacher_id = auth.uid()
      ));
    end if;
  end if;
end $$;


