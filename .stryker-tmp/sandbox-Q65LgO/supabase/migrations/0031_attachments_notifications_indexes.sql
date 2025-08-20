-- Helpful indexes for attachments/notifications lookups
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='attachments') then
    create index if not exists idx_attachments_object_key on public.attachments(object_key);
    create index if not exists idx_attachments_owner on public.attachments(owner_type, owner_id);
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='notifications') then
    create index if not exists idx_notifications_user_created on public.notifications(user_id, created_at desc);
    create index if not exists idx_notifications_unread on public.notifications(user_id) where read_at is null;
  end if;
exception when others then
  raise notice 'attachments/notifications indexes migration skipped: %', sqlerrm;
end $$;


