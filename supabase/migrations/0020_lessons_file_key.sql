-- Optional file_key on lessons for attachments metadata
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='lessons') then
    begin
      alter table public.lessons add column if not exists file_key text;
    exception when others then null;
    end;
  end if;
end $$;


