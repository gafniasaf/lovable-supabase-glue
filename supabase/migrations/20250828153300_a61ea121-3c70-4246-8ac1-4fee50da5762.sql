
-- 1) Create a dedicated storage bucket for Expertfolio files (private)
insert into storage.buckets (id, name, public)
values ('expertfolio-files', 'expertfolio-files', false)
on conflict (id) do nothing;

-- 2) Storage RLS: restrict expertfolio-files bucket to admins only
-- Note: storage.objects RLS is enabled by default in Supabase.
-- We’ll allow only admins to manage objects in this bucket.
create policy "Admins can list expertfolio-files"
on storage.objects for select
to authenticated
using (bucket_id = 'expertfolio-files' and public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can upload to expertfolio-files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'expertfolio-files' and public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can update expertfolio-files"
on storage.objects for update
to authenticated
using (bucket_id = 'expertfolio-files' and public.get_user_role(auth.uid()) = 'admin')
with check (bucket_id = 'expertfolio-files' and public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can delete expertfolio-files"
on storage.objects for delete
to authenticated
using (bucket_id = 'expertfolio-files' and public.get_user_role(auth.uid()) = 'admin');

-- 3) Audit logs RLS
-- Enable admin-only read, and restrict inserts to admins (replaces the existing permissive insert)
alter table public.audit_logs enable row level security;

drop policy if exists audit_logs_select_none on public.audit_logs;
drop policy if exists audit_logs_insert_any_auth on public.audit_logs;

create policy "audit_logs_admin_select"
on public.audit_logs for select
to authenticated
using (public.get_user_role(auth.uid()) = 'admin');

create policy "audit_logs_admin_insert"
on public.audit_logs for insert
to authenticated
with check (public.get_user_role(auth.uid()) = 'admin');

-- 4) Seed a few audit logs for testing (actor_id is uuid in your schema)
insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
values
  (gen_random_uuid(), 'user.login', 'auth', 'n/a', '{}'::jsonb),
  (gen_random_uuid(), 'files.cleanup', 'file', 'file_abc123', '{}'::jsonb),
  (gen_random_uuid(), 'user.update', 'user', 'user_42', '{"field":"email"}'::jsonb);
