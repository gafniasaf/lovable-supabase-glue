-- External Courses Registry (Phase 1)
-- Tables: external_courses, course_versions, assignment_targets, user_aliases, course_events, runtime_audit_logs
-- Alters: interactive_attempts

-- external_courses: registry entry pointing to either a v1 bundle or a v2 launch URL
create table if not exists public.external_courses (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid null references public.course_providers(id) on delete set null,
  kind text not null check (kind in ('v1','v2')),
  title text not null,
  description text null,
  version text not null,
  status text not null default 'draft' check (status in ('draft','approved','disabled')),
  launch_url text null,
  bundle_ref text null,
  scopes text[] null,
  created_at timestamptz not null default now()
);

alter table public.external_courses enable row level security;

-- course_versions: explicit version entries for governance/rollback
create table if not exists public.course_versions (
  id uuid primary key default gen_random_uuid(),
  external_course_id uuid not null references public.external_courses(id) on delete cascade,
  version text not null,
  status text not null default 'approved' check (status in ('draft','approved','disabled')),
  manifest_hash text null,
  launch_url text null,
  created_at timestamptz not null default now(),
  released_at timestamptz null,
  rolled_back_from uuid null references public.course_versions(id) on delete set null
);

alter table public.course_versions enable row level security;

-- assignment_targets: binds an assignment to a native lesson, a v1 bundle lesson, or a v2 launch
create table if not exists public.assignment_targets (
  assignment_id uuid primary key references public.assignments(id) on delete cascade,
  source text not null check (source in ('native','v1','v2')),
  external_course_id uuid null references public.external_courses(id) on delete set null,
  version_id uuid null references public.course_versions(id) on delete set null,
  lesson_slug text null,
  launch_url text null,
  attempt_rules jsonb not null default '{}',
  grading_policy jsonb not null default '{}'
);

alter table public.assignment_targets enable row level security;

-- interactive_attempts: link attempts to assignments when relevant; ensure runtime_attempt_id uniqueness when present
do $$ begin
  begin
    alter table public.interactive_attempts add column if not exists assignment_id uuid null references public.assignments(id) on delete set null;
  exception when undefined_table then
    -- table may not exist in some environments; ignore
    null;
  end;
end $$;

create unique index if not exists uq_interactive_attempts_runtime_id on public.interactive_attempts(runtime_attempt_id) where runtime_attempt_id is not null;

-- user_aliases: per-provider pseudonymous IDs to minimize PII to external runtimes
create table if not exists public.user_aliases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid not null references public.course_providers(id) on delete cascade,
  alias text not null,
  created_at timestamptz not null default now(),
  unique(provider_id, alias)
);

alter table public.user_aliases enable row level security;

-- course_events: append-only stream for runtime telemetry and audit
create table if not exists public.course_events (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid null references auth.users(id) on delete set null,
  assignment_id uuid null references public.assignments(id) on delete set null,
  type text not null,
  payload jsonb not null default '{}',
  request_id text null,
  created_at timestamptz not null default now()
);

alter table public.course_events enable row level security;

-- runtime_audit_logs: coarse audit for rate limits, errors, and provider interactions
create table if not exists public.runtime_audit_logs (
  id uuid primary key default gen_random_uuid(),
  request_id text null,
  kind text not null,
  course_id uuid null,
  user_id uuid null,
  provider_id uuid null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.runtime_audit_logs enable row level security;

-- Minimal RLS policies (app enforces most logic; tighten in later migrations)
do $$ begin
  -- external_courses: admin read for now (app-layer enforces admin)
  if not exists (select 1 from pg_policies where polname = 'external_courses_select_all') then
    create policy external_courses_select_all on public.external_courses for select to authenticated using (true);
  end if;

  -- course_versions
  if not exists (select 1 from pg_policies where polname = 'course_versions_select_all') then
    create policy course_versions_select_all on public.course_versions for select to authenticated using (true);
  end if;

  -- assignment_targets: teachers and enrolled students will be checked in app layer; allow select for authenticated
  if not exists (select 1 from pg_policies where polname = 'assignment_targets_select_all') then
    create policy assignment_targets_select_all on public.assignment_targets for select to authenticated using (true);
  end if;

  -- user_aliases: user can read own aliases
  if not exists (select 1 from pg_policies where polname = 'user_aliases_select_own') then
    create policy user_aliases_select_own on public.user_aliases for select to authenticated using (user_id = auth.uid());
  end if;

  -- course_events: teachers of the course and the user owner can read; keep permissive for now
  if not exists (select 1 from pg_policies where polname = 'course_events_select_all') then
    create policy course_events_select_all on public.course_events for select to authenticated using (true);
  end if;

  -- runtime_audit_logs: admin reads only (app-layer)
  if not exists (select 1 from pg_policies where polname = 'runtime_audit_logs_select_all') then
    create policy runtime_audit_logs_select_all on public.runtime_audit_logs for select to authenticated using (true);
  end if;
end $$;


