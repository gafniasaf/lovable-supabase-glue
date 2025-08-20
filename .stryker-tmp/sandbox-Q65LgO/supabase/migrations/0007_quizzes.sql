-- Quizzes and assessments (MVP)
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  time_limit_sec int,
  points int not null default 100,
  created_at timestamptz not null default now()
);

create index if not exists idx_quizzes_course on public.quizzes(course_id);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  text text not null,
  order_index int not null default 1
);

create index if not exists idx_questions_quiz_order on public.quiz_questions(quiz_id, order_index);

create table if not exists public.quiz_choices (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  text text not null,
  correct boolean not null default false,
  order_index int not null default 1
);

create index if not exists idx_choices_question_order on public.quiz_choices(question_id, order_index);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score int not null default 0
);

create index if not exists idx_attempts_quiz_student on public.quiz_attempts(quiz_id, student_id);

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  choice_id uuid not null references public.quiz_choices(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create index if not exists idx_answers_attempt_question on public.quiz_answers(attempt_id, question_id);

alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_choices enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_answers enable row level security;

-- Policies (MVP): rely on app-layer guards; add basic read policies
create policy if not exists quizzes_select_course_teacher on public.quizzes
for select to authenticated using (
  exists (select 1 from public.courses c where c.id = quizzes.course_id and c.teacher_id = auth.uid())
);

create policy if not exists quizzes_select_course_student on public.quizzes
for select to authenticated using (
  exists (
    select 1 from public.enrollments e where e.course_id = quizzes.course_id and e.student_id = auth.uid()
  )
);

create policy if not exists quizzes_insert_teacher on public.quizzes
for insert to authenticated with check (
  exists (select 1 from public.courses c where c.id = quizzes.course_id and c.teacher_id = auth.uid())
);

create policy if not exists quizzes_update_teacher on public.quizzes
for update to authenticated using (
  exists (select 1 from public.courses c where c.id = quizzes.course_id and c.teacher_id = auth.uid())
) with check (
  exists (select 1 from public.courses c where c.id = quizzes.course_id and c.teacher_id = auth.uid())
);

create policy if not exists quizzes_delete_teacher on public.quizzes
for delete to authenticated using (
  exists (select 1 from public.courses c where c.id = quizzes.course_id and c.teacher_id = auth.uid())
);

-- Quiz questions policies (teacher only)
create policy if not exists quiz_questions_select on public.quiz_questions
for select to authenticated using (
  exists (
    select 1 from public.quizzes q join public.courses c on c.id = q.course_id
    where q.id = quiz_questions.quiz_id and (c.teacher_id = auth.uid() or exists (
      select 1 from public.enrollments e where e.course_id = c.id and e.student_id = auth.uid()
    ))
  )
);

create policy if not exists quiz_questions_insert_teacher on public.quiz_questions
for insert to authenticated with check (
  exists (select 1 from public.quizzes q join public.courses c on c.id = q.course_id where q.id = quiz_questions.quiz_id and c.teacher_id = auth.uid())
);

-- Quiz choices policies (teacher only for write, readable to enrolled)
create policy if not exists quiz_choices_select on public.quiz_choices
for select to authenticated using (
  exists (
    select 1 from public.quiz_questions qq join public.quizzes q on q.id = qq.quiz_id join public.courses c on c.id = q.course_id
    where qq.id = quiz_choices.question_id and (c.teacher_id = auth.uid() or exists (
      select 1 from public.enrollments e where e.course_id = c.id and e.student_id = auth.uid()
    ))
  )
);

create policy if not exists quiz_choices_insert_teacher on public.quiz_choices
for insert to authenticated with check (
  exists (
    select 1 from public.quiz_questions qq join public.quizzes q on q.id = qq.quiz_id join public.courses c on c.id = q.course_id
    where qq.id = quiz_choices.question_id and c.teacher_id = auth.uid()
  )
);

-- Attempts policies: students manage own attempts/answers; teachers can read attempts
create policy if not exists quiz_attempts_select_teacher on public.quiz_attempts
for select to authenticated using (
  exists (
    select 1 from public.quizzes q join public.courses c on c.id = q.course_id
    where q.id = quiz_attempts.quiz_id and c.teacher_id = auth.uid()
  )
);

create policy if not exists quiz_attempts_select_student on public.quiz_attempts
for select to authenticated using (student_id = auth.uid());

create policy if not exists quiz_attempts_insert_student on public.quiz_attempts
for insert to authenticated with check (student_id = auth.uid());

create policy if not exists quiz_attempts_update_student on public.quiz_attempts
for update to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy if not exists quiz_answers_select_student on public.quiz_answers
for select to authenticated using (
  exists (
    select 1 from public.quiz_attempts a where a.id = quiz_answers.attempt_id and a.student_id = auth.uid()
  )
);

create policy if not exists quiz_answers_insert_student on public.quiz_answers
for insert to authenticated with check (
  exists (
    select 1 from public.quiz_attempts a where a.id = quiz_answers.attempt_id and a.student_id = auth.uid()
  )
);

create policy if not exists quiz_answers_update_student on public.quiz_answers
for update to authenticated using (
  exists (
    select 1 from public.quiz_attempts a where a.id = quiz_answers.attempt_id and a.student_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.quiz_attempts a where a.id = quiz_answers.attempt_id and a.student_id = auth.uid()
  )
);


