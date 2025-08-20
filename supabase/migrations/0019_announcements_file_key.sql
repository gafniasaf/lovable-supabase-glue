-- Add optional file_key to announcements for attachments
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='announcements') then
    begin
      alter table public.announcements add column if not exists file_key text;
    exception when others then null;
    end;
  end if;
end $$;


