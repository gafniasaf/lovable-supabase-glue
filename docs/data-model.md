### Data model and RLS

Managed by SQL migrations under `supabase/migrations`.

#### Tables

- profiles
  - id uuid PK (auth.users.id)
  - email text not null
  - role text enum('student','teacher','parent')
  - created_at timestamptz default now()

- courses
  - id uuid PK default gen_random_uuid()
  - title text not null
  - description text nullable
  - teacher_id uuid not null (auth.users.id)
  - created_at timestamptz default now()

- enrollments
  - id uuid PK default gen_random_uuid()
  - student_id uuid not null (auth.users.id)
  - course_id uuid not null (courses.id)
  - enrolled_at timestamptz default now()
  - unique(student_id, course_id)

- lessons
  - id uuid PK default gen_random_uuid()
  - course_id uuid not null (courses.id)
  - title text not null (3..200)
  - content text not null default ''
  - order_index int not null default 1
  - created_at timestamptz default now()

- modules
  - id uuid PK default gen_random_uuid()
  - course_id uuid not null (courses.id)
  - title text not null (3..200)
  - order_index int not null default 1
  - created_at timestamptz default now()

- assignments
  - id uuid PK default gen_random_uuid()
  - course_id uuid not null (courses.id)
  - title text not null
  - description text nullable
  - due_at timestamptz nullable
  - points int not null default 100
  - created_at timestamptz not null default now()

- submissions
  - id uuid PK default gen_random_uuid()
  - assignment_id uuid not null (assignments.id)
  - student_id uuid not null (auth.users.id)
  - text text not null default ''
  - file_url text nullable
  - submitted_at timestamptz not null default now()
  - score int nullable
  - feedback text nullable

- parent_links
  - id uuid PK default gen_random_uuid()
  - parent_id uuid not null
  - student_id uuid not null
  - created_at timestamptz not null default now()
  - unique(parent_id, student_id)

- quizzes
  - id uuid PK default gen_random_uuid()
  - course_id uuid not null (courses.id)
  - title text not null
  - time_limit_sec int nullable
  - points int not null default 100
  - created_at timestamptz not null default now()

- quiz_questions
  - id uuid PK default gen_random_uuid()
  - quiz_id uuid not null (quizzes.id)
  - text text not null
  - order_index int not null default 1

- quiz_choices
  - id uuid PK default gen_random_uuid()
  - question_id uuid not null (quiz_questions.id)
  - text text not null
  - correct boolean not null default false
  - order_index int not null default 1

- quiz_attempts
  - id uuid PK default gen_random_uuid()
  - quiz_id uuid not null (quizzes.id)
  - student_id uuid not null (auth.users.id)
  - started_at timestamptz not null default now()
  - submitted_at timestamptz nullable
  - score int not null default 0

- quiz_answers
  - id uuid PK default gen_random_uuid()
  - attempt_id uuid not null (quiz_attempts.id)
  - question_id uuid not null (quiz_questions.id)
  - choice_id uuid not null (quiz_choices.id)
  - created_at timestamptz not null default now()
  - unique(attempt_id, question_id)

#### Triggers

- `handle_new_user` inserts a profile row on auth user creation, defaulting role from `raw_user_meta_data.role` or `student`.

#### RLS Policies (selected)

- profiles
  - select/insert restricted to the authenticated user (self)

- courses
  - select: teacher_id = auth.uid() OR enrolled students via exists(enrollments)
  - insert/update/delete: only teachers and only for `teacher_id = auth.uid()`

- enrollments
  - select: by student self or teacher of the course
  - insert/delete: by student self

- lessons
  - select: teacher owner of course OR enrolled students
  - insert/update/delete: teacher owner only

- modules
  - select/insert/update/delete: teacher owner of the course only

- assignments, submissions
  - MVP policies are permissive for authenticated users; stricter checks are enforced in the application layer (teachers manage assignments; students create submissions; teachers grade)

- parent_links
  - parents can select their own links; writes are enforced in the application layer for admins

- quizzes, quiz_questions, quiz_choices
  - teachers can manage (insert/update/delete)
  - teachers and enrolled students can select

- quiz_attempts, quiz_answers
  - students manage their own attempts/answers; teachers can select attempts for quizzes they own

---

### External Courses — Implemented + Planned Tables

- external_courses (implemented in `0028_external_courses_registry.sql`)
  - `id uuid pk`, `vendor_id uuid fk course_providers`, `kind text enum('v1','v2')`, `title text`, `description text`, `version text`, `status text`, `launch_url text`, `bundle_ref text`, `scopes text[]`, `created_at timestamptz`

- course_versions (implemented)
  - `id uuid pk`, `external_course_id uuid fk`, `version text`, `status text`, `manifest_hash text`, `launch_url text`, `created_at timestamptz`, `released_at timestamptz`, `rolled_back_from uuid null`

- assignment_targets (implemented)
  - `assignment_id uuid pk fk assignments`, `source text enum('native','v1','v2')`, `external_course_id uuid null`, `version_id uuid null`, `lesson_slug text null`, `launch_url text null`, `attempt_rules jsonb`, `grading_policy jsonb`

- user_aliases (implemented)
  - `id uuid pk`, `user_id uuid fk auth.users`, `provider_id uuid fk course_providers`, `alias text`, unique(provider_id, alias), `created_at timestamptz`

- course_events (append‑only, implemented)
  - `id uuid pk`, `course_id uuid`, `user_id uuid`, `assignment_id uuid null`, `type text`, `payload jsonb`, `request_id text`, `created_at timestamptz`

- runtime_checkpoints (implemented in `0051_runtime_checkpoints.sql`)
  - `id uuid pk`, `course_id uuid`, `alias text`, `key text`, `state jsonb`, `created_at timestamptz`, `updated_at timestamptz`, unique(course_id, alias, key)

- dead_letters (Phase 3)
  - `id uuid pk`, `kind text`, `payload jsonb`, `error text`, `next_attempt_at timestamptz`, `attempts int`, `created_at timestamptz`

- usage_counters (Phase 3)
  - `day date`, `provider_id uuid`, `course_id uuid`, `metric text`, `count bigint`, `storage_bytes bigint`, `compute_minutes bigint`, primary key(day, provider_id, course_id, metric)

RLS (high‑level planned):
- `external_courses`, `course_versions`: admin write; tenant‑scoped reads (app‑layer enforced currently)
- `assignment_targets`: teacher owner write; students read for own assignments (app‑layer enforced currently)
- `user_aliases`: user self read; server write
- `course_events`: server write; admin read; teachers read for own courses; students read own events
- `runtime_checkpoints`: server writes; teachers can read rows for their courses (enforced in DB policy); alias-based access handled in app layer

#### Indexes

- `idx_enrollments_student`, `idx_enrollments_course`
- `idx_courses_teacher`
- `idx_lessons_course_order`
- `idx_modules_course_order`
- `idx_assignments_course_order`
- `idx_submissions_assignment`, `idx_submissions_student`
- `idx_quizzes_course`, `idx_questions_quiz_order`, `idx_choices_question_order`, `idx_attempts_quiz_student`, `idx_answers_attempt_question`

#### Progress (MVP addition)

- `progress`
  - `user_id uuid` not null (auth.users.id)
  - `lesson_id uuid` not null (lessons.id)
  - `completed_at timestamptz` default now()
  - primary key `(user_id, lesson_id)`

RLS:
- select/insert/delete where `user_id = auth.uid()`
- optional teacher read by joining lessons→courses for owned courses (app-layer checks also apply)

#### Security & RLS hardening (planned)

- Assignments
  - insert/update/delete: teacher of the course only (DB-enforced)
  - select: teachers of the course and enrolled students
- Submissions
  - insert/select: student self only
  - update (grade): teacher of the course only
- Notifications
  - select/update: owner user only
- Interactive tables (`interactive_attempts`, `interactive_launch_tokens`)
  - `interactive_attempts`: insert by server (service role) or constrained via app; select by course teacher and the user owner
  - `interactive_launch_tokens`: insert by server; nonce/exp validated in app; no public selects

Additional tables (future):
- `announcements`, `message_threads`, `message_thread_participants`, `messages`, `events`, optional `attachments` with RLS as outlined in product plan.
