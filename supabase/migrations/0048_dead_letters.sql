-- Dead letters table for failed jobs/events
create table if not exists public.dead_letters (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  error text not null default '',
  next_attempt_at timestamptz null,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.dead_letters enable row level security;

-- Admin-only select/update/delete/insert policies (profiles.role = 'admin')
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'dead_letters_admin_select') then
    create policy dead_letters_admin_select on public.dead_letters
      for select to authenticated
      using ( exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );
  end if;
  if not exists (select 1 from pg_policies where polname = 'dead_letters_admin_modify') then
    create policy dead_letters_admin_modify on public.dead_letters
      for all to authenticated
      using ( exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') )
      with check ( exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );
  end if;
end $$;

create index if not exists idx_dead_letters_kind on public.dead_letters(kind);
create index if not exists idx_dead_letters_next_attempt on public.dead_letters(next_attempt_at);


