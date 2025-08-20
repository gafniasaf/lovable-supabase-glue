-- RLS policies for messaging tables
do $$ begin
  -- message_threads: participants only can select
  if not exists (select 1 from pg_policies where polname = 'message_threads_participant_select') then
    create policy message_threads_participant_select on public.message_threads
    for select to authenticated using (
      exists (
        select 1 from public.message_thread_participants p where p.thread_id = message_threads.id and p.user_id = auth.uid()
      )
    );
  end if;

  -- message_thread_participants: participant can select own threads' participants
  if not exists (select 1 from pg_policies where polname = 'participants_select_participant') then
    create policy participants_select_participant on public.message_thread_participants
    for select to authenticated using (
      exists (
        select 1 from public.message_thread_participants p where p.thread_id = message_thread_participants.thread_id and p.user_id = auth.uid()
      )
    );
  end if;

  -- messages: participants can select; insert only by participants
  if not exists (select 1 from pg_policies where polname = 'messages_select_participant') then
    create policy messages_select_participant on public.messages
    for select to authenticated using (
      exists (
        select 1 from public.message_thread_participants p where p.thread_id = messages.thread_id and p.user_id = auth.uid()
      )
    );
  end if;
  if not exists (select 1 from pg_policies where polname = 'messages_insert_participant') then
    create policy messages_insert_participant on public.messages
    for insert to authenticated with check (
      exists (
        select 1 from public.message_thread_participants p where p.thread_id = messages.thread_id and p.user_id = auth.uid()
      )
    );
  end if;
end $$;


