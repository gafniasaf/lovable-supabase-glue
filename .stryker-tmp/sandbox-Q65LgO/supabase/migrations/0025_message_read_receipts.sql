-- Per-user message read receipts
create table if not exists public.message_read_receipts (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null,
  read_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

alter table public.message_read_receipts enable row level security;

do $$
begin
  -- Participants can select their own receipts
  if not exists (select 1 from pg_policies where polname = 'mrr_select_participant_own') then
    create policy mrr_select_participant_own on public.message_read_receipts
    for select to authenticated
    using (
      user_id = auth.uid() and exists (
        select 1 from public.messages m
        join public.message_thread_participants p on p.thread_id = m.thread_id and p.user_id = auth.uid()
        where m.id = message_read_receipts.message_id
      )
    );
  end if;

  -- Participants can insert their own receipts for messages in threads they participate in
  if not exists (select 1 from pg_policies where polname = 'mrr_insert_participant_own') then
    create policy mrr_insert_participant_own on public.message_read_receipts
    for insert to authenticated
    with check (
      user_id = auth.uid() and exists (
        select 1 from public.messages m
        join public.message_thread_participants p on p.thread_id = m.thread_id and p.user_id = auth.uid()
        where m.id = message_read_receipts.message_id
      )
    );
  end if;
end $$;


