-- Ensure 'admin' is allowed in profiles.role check constraint
do $$
declare
  conname text;
begin
  select conname into conname
  from pg_constraint
  where conrelid = 'public.profiles'::regclass
    and contype = 'c'
    and array_to_string(conkey, ',') = (
      select array_to_string(array_agg(attnum order by attnum), ',') from pg_attribute where attrelid = 'public.profiles'::regclass and attname = 'role'
    );
  if conname is not null then
    execute format('alter table public.profiles drop constraint %I', conname);
  end if;
  alter table public.profiles add constraint profiles_role_check check (role in ('student','teacher','parent','admin'));
end $$;


