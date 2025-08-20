-- Quizzes and assessments schema (deprecated duplicate)
create table if not exists public.quizzes (
	id uuid primary key default gen_random_uuid(),
	course_id uuid not null,
	title text not null,
	time_limit_sec int,
	points int not null default 100,
	created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
	id uuid primary key default gen_random_uuid(),
	quiz_id uuid not null,
	text text not null,
	order_index int not null default 1
);

create table if not exists public.quiz_choices (
	id uuid primary key default gen_random_uuid(),
	question_id uuid not null,
	text text not null,
	correct boolean not null default false,
	order_index int not null default 1
);

create table if not exists public.quiz_attempts (
	id uuid primary key default gen_random_uuid(),
	quiz_id uuid not null,
	student_id uuid not null,
	started_at timestamptz not null default now(),
	submitted_at timestamptz,
	score int not null default 0
);

create table if not exists public.quiz_answers (
	id uuid primary key default gen_random_uuid(),
	attempt_id uuid not null,
	question_id uuid not null,
	choice_id uuid not null,
	created_at timestamptz not null default now(),
	constraint uq_attempt_question unique (attempt_id, question_id)
);

create index if not exists idx_quizzes_course on public.quizzes(course_id);
create index if not exists idx_questions_quiz_order on public.quiz_questions(quiz_id, order_index);
create index if not exists idx_choices_question_order on public.quiz_choices(question_id, order_index);
create index if not exists idx_attempts_quiz_student on public.quiz_attempts(quiz_id, student_id);
create index if not exists idx_answers_attempt_question on public.quiz_answers(attempt_id, question_id);

-- Note: RLS and full FKs are defined authoritatively in 0007_quizzes.sql.
-- This migration remains a no-op to avoid conflicts in existing environments.
do $$ begin end $$;


