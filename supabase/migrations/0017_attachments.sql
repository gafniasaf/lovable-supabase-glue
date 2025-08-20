-- Attachments metadata table to track ownership and object keys

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null,
  owner_id uuid not null,
  bucket text not null,
  object_key text not null,
  content_type text not null,
  filename text,
  created_at timestamptz not null default now()
);

alter table public.attachments enable row level security;

-- Owner read policy: students can read their own; teachers/admin may read based on app-layer checks (extend as needed)
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'attachments_select_owner_basic') then
    create policy attachments_select_owner_basic on public.attachments
    for select to authenticated
    using (
      -- Basic rule: if owner_type is 'user' or 'submission' use owner_id match; refine per domain later
      owner_id = auth.uid()
    );
  end if;
  -- Insert is done by server after upload; no public insert
end $$;


