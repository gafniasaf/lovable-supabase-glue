-- Launch tokens tracking (nonce one-time-use and expiry)
create table if not exists public.interactive_launch_tokens (
  nonce text primary key,
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exp timestamptz not null,
  used_at timestamptz
);

alter table public.interactive_launch_tokens enable row level security;

-- Only system routes should write; allow users to read their own (for debugging minimal)
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'ilt_select_own') then
    create policy ilt_select_own on public.interactive_launch_tokens for select to authenticated using (user_id = auth.uid());
  end if;
end $$;


