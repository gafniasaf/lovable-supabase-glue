-- Profiles: extend with display fields and preferences
alter table if exists public.profiles
  add column if not exists display_name text,
  add column if not exists avatar_url text,
  add column if not exists bio text,
  add column if not exists preferences jsonb not null default '{}'::jsonb;

-- Allow users to update their own profile
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own'
  ) then
    create policy "profiles_update_own" on public.profiles
    for update to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);
  end if;
end$$;


