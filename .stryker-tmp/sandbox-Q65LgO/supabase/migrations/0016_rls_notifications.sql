-- RLS for notifications: owner-only read/update

do $$ begin
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'notifications') then
    raise notice 'notifications table missing; skipping policies';
  else
    alter table public.notifications enable row level security;
    if not exists (select 1 from pg_policies where polname = 'notifications_select_owner') then
      create policy notifications_select_owner on public.notifications
      for select to authenticated using (user_id = auth.uid());
    end if;
    if not exists (select 1 from pg_policies where polname = 'notifications_update_owner') then
      create policy notifications_update_owner on public.notifications
      for update to authenticated using (user_id = auth.uid());
    end if;
    -- Inserts come from server with service role; no public insert policy
  end if;
end $$;


