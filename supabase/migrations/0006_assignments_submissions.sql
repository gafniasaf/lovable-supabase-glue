-- Assignments and Submissions MVP
create extension if not exists pgcrypto;

-- Assignments
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  points int not null default 100,
  created_at timestamptz not null default now()
);

alter table public.assignments enable row level security;

create index if not exists idx_assignments_course_order on public.assignments (course_id, created_at desc);

-- Submissions
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  text text not null default '',
  file_url text,
  submitted_at timestamptz not null default now(),
  score int,
  feedback text
);

alter table public.submissions enable row level security;

create index if not exists idx_submissions_assignment on public.submissions (assignment_id);
create index if not exists idx_submissions_student on public.submissions (student_id);

-- Tightened policies: teachers can read/write their course assignments; students can read if enrolled
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'assignments_select_teacher_student') then
    create policy assignments_select_teacher_student on public.assignments for select to authenticated using (
      exists (select 1 from public.courses c where c.id = assignments.course_id and c.teacher_id = auth.uid())
      or exists (select 1 from public.enrollments e where e.course_id = assignments.course_id and e.student_id = auth.uid())
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where polname = 'assignments_modify_teacher') then
    create policy assignments_modify_teacher on public.assignments for all to authenticated using (
      exists (select 1 from public.courses c where c.id = assignments.course_id and c.teacher_id = auth.uid())
    ) with check (
      exists (select 1 from public.courses c where c.id = assignments.course_id and c.teacher_id = auth.uid())
    );
  end if;
end $$;

-- Submissions: students can read/write their own; teachers can read for their courses
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'submissions_select_teacher_student') then
    create policy submissions_select_teacher_student on public.submissions for select to authenticated using (
      exists (
        select 1 from public.assignments a join public.courses c on c.id = a.course_id
        where a.id = submissions.assignment_id and c.teacher_id = auth.uid()
      )
      or submissions.student_id = auth.uid()
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where polname = 'submissions_insert_student') then
    create policy submissions_insert_student on public.submissions for insert to authenticated with check (
      submissions.student_id = auth.uid()
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where polname = 'submissions_update_student_or_teacher') then
    create policy submissions_update_student_or_teacher on public.submissions for update to authenticated using (
      submissions.student_id = auth.uid() or exists (
        select 1 from public.assignments a join public.courses c on c.id = a.course_id
        where a.id = submissions.assignment_id and c.teacher_id = auth.uid()
      )
    ) with check (
      submissions.student_id = auth.uid() or exists (
        select 1 from public.assignments a join public.courses c on c.id = a.course_id
        where a.id = submissions.assignment_id and c.teacher_id = auth.uid()
      )
    );
  end if;
end $$;


