-- Notification preferences per user
create table if not exists public.notification_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.notification_prefs enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where polname = 'notification_prefs_owner') then
    create policy notification_prefs_owner on public.notification_prefs
    for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;


