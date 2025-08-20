-- Progress table for lesson completion
create table if not exists public.progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.progress enable row level security;

-- Students manage their own progress
do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'progress' and polname = 'progress_select_own') then
    create policy progress_select_own on public.progress for select to authenticated using (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'progress' and polname = 'progress_insert_own') then
    create policy progress_insert_own on public.progress for insert to authenticated with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'progress' and polname = 'progress_delete_own') then
    create policy progress_delete_own on public.progress for delete to authenticated using (user_id = auth.uid());
  end if;
end $$;

-- Optional teacher read for course-owned lessons (non-strict; app-layer can use)
-- create policy progress_select_teacher on public.progress
-- for select to authenticated using (
--   exists (
--     select 1 from public.lessons l join public.courses c on c.id = l.course_id
--     where l.id = progress.lesson_id and c.teacher_id = auth.uid()
--   )
-- );


