-- Modules table with RLS
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 200),
  order_index int not null default 1,
  created_at timestamptz not null default now()
);

alter table public.modules enable row level security;

-- Select: only teacher who owns the course
create policy if not exists modules_select_teacher on public.modules
for select using (
  exists (
    select 1 from public.courses c
    where c.id = modules.course_id and c.teacher_id = auth.uid()
  )
);

-- Insert: only teacher who owns the course
create policy if not exists modules_insert_teacher on public.modules
for insert with check (
  exists (
    select 1 from public.courses c
    where c.id = modules.course_id and c.teacher_id = auth.uid()
  )
);

-- Update: only teacher who owns the course
create policy if not exists modules_update_teacher on public.modules
for update using (
  exists (
    select 1 from public.courses c
    where c.id = modules.course_id and c.teacher_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.courses c
    where c.id = modules.course_id and c.teacher_id = auth.uid()
  )
);

-- Delete: only teacher who owns the course
create policy if not exists modules_delete_teacher on public.modules
for delete using (
  exists (
    select 1 from public.courses c
    where c.id = modules.course_id and c.teacher_id = auth.uid()
  )
);

create index if not exists idx_modules_course_order on public.modules(course_id, order_index);



