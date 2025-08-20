-- RLS policy to allow participants to update messages.read_at in their threads
do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'messages') then
    raise notice 'messages table missing; skipping policies';
  else
    if not exists (select 1 from pg_policies where polname = 'messages_update_read_participant') then
      create policy messages_update_read_participant on public.messages
      for update to authenticated
      using (
        exists (
          select 1 from public.message_thread_participants p
          where p.thread_id = messages.thread_id and p.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.message_thread_participants p
          where p.thread_id = messages.thread_id and p.user_id = auth.uid()
        )
      );
    end if;
  end if;
end $$;


