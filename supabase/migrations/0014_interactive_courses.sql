-- Interactive course extensions
alter table if exists public.courses
  add column if not exists launch_kind text check (launch_kind in ('WebEmbed','RemoteContainer','StreamedDesktop')),
  add column if not exists launch_url text,
  add column if not exists scopes text[],
  add column if not exists provider_id uuid;

create table if not exists public.course_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  jwks_url text not null,
  domain text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.interactive_attempts (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  runtime_attempt_id text,
  score int,
  max int,
  passed boolean,
  pct int,
  topic text,
  created_at timestamptz not null default now()
);

alter table public.interactive_attempts enable row level security;

-- Basic RLS: student can see own, teacher can see attempts in their courses
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'interactive_attempts_select_student') then
    create policy interactive_attempts_select_student on public.interactive_attempts for select to authenticated using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where polname = 'interactive_attempts_select_teacher') then
    create policy interactive_attempts_select_teacher on public.interactive_attempts for select to authenticated using (
      exists (select 1 from public.courses c where c.id = interactive_attempts.course_id and c.teacher_id = auth.uid())
    );
  end if;
  if not exists (select 1 from pg_policies where polname = 'interactive_attempts_insert_student') then
    create policy interactive_attempts_insert_student on public.interactive_attempts for insert to authenticated with check (user_id = auth.uid());
  end if;
end $$;


