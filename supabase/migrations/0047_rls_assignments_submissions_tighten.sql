-- Tighten RLS for submissions insert/update and teacher grading boundaries
-- - Students may insert only for assignments in courses they are enrolled in
-- - Students may update only their own ungraded submissions (score IS NULL)
-- - Teachers may update submissions only for courses they own (grading)

do $$ begin
  -- Ensure RLS is enabled
  alter table if exists public.submissions enable row level security;

  -- Replace insert policy to require enrollment in the assignment's course
  if exists (select 1 from pg_policies where schemaname='public' and tablename='submissions' and polname='submissions_insert_student') then
    drop policy submissions_insert_student on public.submissions;
  end if;
  create policy submissions_insert_student on public.submissions
  for insert to authenticated
  with check (
    student_id = auth.uid()
    and exists (
      select 1
      from public.assignments a
      join public.enrollments e on e.course_id = a.course_id and e.student_id = auth.uid()
      where a.id = submissions.assignment_id
    )
  );

  -- Ensure student update policy only allows ungraded updates (preserves 0026 intent)
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='submissions' and polname='submissions_update_student_ungraded') then
    create policy submissions_update_student_ungraded on public.submissions
    for update to authenticated
    using (student_id = auth.uid() and score is null)
    with check (student_id = auth.uid() and score is null);
  end if;

  -- Ensure teacher update policy exists and is scoped to course ownership
  if exists (select 1 from pg_policies where schemaname='public' and tablename='submissions' and polname='submissions_update_grade_teacher') then
    -- keep existing
    perform 1;
  else
    create policy submissions_update_grade_teacher on public.submissions
    for update to authenticated
    using (
      exists (
        select 1 from public.assignments a join public.courses c on c.id = a.course_id
        where a.id = submissions.assignment_id and c.teacher_id = auth.uid()
      )
    );
  end if;
end $$;


