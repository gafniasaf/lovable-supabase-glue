-- Lessons table with RLS
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 200),
  content text not null default '',
  order_index int not null default 1,
  created_at timestamptz not null default now()
);

alter table public.lessons enable row level security;

-- Select: teacher who owns the course
create policy if not exists lessons_select_teacher on public.lessons
for select using (
  exists (
    select 1 from public.courses c
    where c.id = lessons.course_id and c.teacher_id = auth.uid()
  )
);

-- Select: students enrolled in the course
create policy if not exists lessons_select_student on public.lessons
for select using (
  exists (
    select 1 from public.enrollments e
    join public.courses c on c.id = e.course_id
    where e.course_id = lessons.course_id and e.student_id = auth.uid()
  )
);

-- Insert: only teacher who owns the course
create policy if not exists lessons_insert_teacher on public.lessons
for insert with check (
  exists (
    select 1 from public.courses c
    where c.id = lessons.course_id and c.teacher_id = auth.uid()
  )
);

-- Update: only teacher who owns the course
create policy if not exists lessons_update_teacher on public.lessons
for update using (
  exists (
    select 1 from public.courses c
    where c.id = lessons.course_id and c.teacher_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.courses c
    where c.id = lessons.course_id and c.teacher_id = auth.uid()
  )
);

-- Delete: only teacher who owns the course
create policy if not exists lessons_delete_teacher on public.lessons
for delete using (
  exists (
    select 1 from public.courses c
    where c.id = lessons.course_id and c.teacher_id = auth.uid()
  )
);

create index if not exists idx_lessons_course_order on public.lessons(course_id, order_index);


