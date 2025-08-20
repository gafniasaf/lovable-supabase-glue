-- Add filename column to attachments if missing
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='attachments') then
    begin
      alter table public.attachments add column if not exists filename text;
    exception when others then null;
    end;
  end if;
end $$;


