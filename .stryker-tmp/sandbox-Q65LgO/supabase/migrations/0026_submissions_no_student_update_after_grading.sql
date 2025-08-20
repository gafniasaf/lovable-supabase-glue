-- Disallow students from updating a submission after it has been graded
-- Split student vs teacher update policies; remove permissive prior policy if present

do $$ begin
  -- Drop legacy combined policy if it exists
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'submissions' and polname = 'submissions_update_student_or_teacher') then
    drop policy submissions_update_student_or_teacher on public.submissions;
  end if;

  -- Ensure table exists
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'submissions') then
    raise notice 'submissions table missing; skipping policies';
  else
    alter table public.submissions enable row level security;

    -- Students can update their own ungraded submissions only (score IS NULL)
    if not exists (select 1 from pg_policies where polname = 'submissions_update_student_ungraded') then
      create policy submissions_update_student_ungraded on public.submissions
      for update to authenticated
      using (student_id = auth.uid() and score is null)
      with check (student_id = auth.uid() and score is null);
    end if;

    -- Keep/ensure teacher update policy exists (grade/edit submissions for their courses)
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


