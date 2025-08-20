-- Enable required extensions for UUID generation (if not already enabled)
create extension if not exists pgcrypto;

-- Profiles: store role per user for RLS decisions
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('student','teacher','parent')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Allow users to read their own profile and teachers to read their own
create policy "profiles_read_own" on public.profiles
for select to authenticated
using (auth.uid() = id);

-- Allow users to insert their own profile (fallback if no trigger exists)
create policy "profiles_insert_own" on public.profiles
for insert to authenticated
with check (auth.uid() = id);

-- Courses
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

-- Teachers can see their own courses
create policy "courses_teacher_select_own" on public.courses
for select to authenticated
using (teacher_id = auth.uid());

-- Students can see courses they are enrolled in (via join policy below)
-- We'll add a separate policy using an exists clause referencing enrollments

-- Teachers can insert their own courses only if they have role 'teacher'
create policy "courses_teacher_insert" on public.courses
for insert to authenticated
with check (
  teacher_id = auth.uid()
  and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'
  )
);

-- Teachers can update/delete only their own courses
create policy "courses_teacher_update_own" on public.courses
for update to authenticated
using (
  teacher_id = auth.uid() and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'
  )
);

create policy "courses_teacher_delete_own" on public.courses
for delete to authenticated
using (
  teacher_id = auth.uid() and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'
  )
);

-- Enrollments
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (student_id, course_id)
);

alter table public.enrollments enable row level security;

-- Students can see their own enrollments
create policy "enrollments_student_select_own" on public.enrollments
for select to authenticated
using (student_id = auth.uid());

-- Teachers can see enrollments for their courses
create policy "enrollments_teacher_select_course" on public.enrollments
for select to authenticated
using (
  exists (
    select 1 from public.courses c
    where c.id = enrollments.course_id and c.teacher_id = auth.uid()
  )
);

-- Students can enroll themselves
create policy "enrollments_student_insert_self" on public.enrollments
for insert to authenticated
with check (student_id = auth.uid());

-- Students can delete their own enrollment
create policy "enrollments_student_delete_self" on public.enrollments
for delete to authenticated
using (student_id = auth.uid());

-- View policy for students to read course details they are enrolled in
create policy "courses_student_select_enrolled" on public.courses
for select to authenticated
using (
  exists (
    select 1 from public.enrollments e
    where e.course_id = courses.id and e.student_id = auth.uid()
  )
);

-- Helpful indexes
create index if not exists idx_enrollments_student on public.enrollments (student_id);
create index if not exists idx_enrollments_course on public.enrollments (course_id);
create index if not exists idx_courses_teacher on public.courses (teacher_id);


