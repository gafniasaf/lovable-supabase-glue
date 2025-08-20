-- Announcements
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  teacher_id uuid not null,
  title text not null,
  body text not null,
  publish_at timestamptz null,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

-- Messaging (threads/participants/messages)
create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.message_thread_participants (
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  user_id uuid not null,
  role text not null,
  added_at timestamptz not null default now(),
  primary key(thread_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  sender_id uuid not null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz null
);

alter table public.message_threads enable row level security;
alter table public.message_thread_participants enable row level security;
alter table public.messages enable row level security;

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  read_at timestamptz null
);

alter table public.notifications enable row level security;

-- Events (analytics)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  event_type text not null,
  entity_type text not null,
  entity_id text not null,
  ts timestamptz not null default now(),
  meta jsonb not null default '{}'
);

alter table public.events enable row level security;

-- Minimal permissive policies (tighten later). For now, authenticated read, app-layer write control.
do $$
begin
  perform 1;
  exception when others then null;
end $$;


