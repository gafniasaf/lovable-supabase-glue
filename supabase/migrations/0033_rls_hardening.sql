-- RLS hardening and indexes for attachments and runtime_checkpoints

-- Tighten attachments RLS: allow select when owner_id matches or when owner_type allows teacher-of-course access (enforced via app-level checks today); keep insert/update by server only.
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='attachments') then
    -- Ensure table has RLS enabled (idempotent)
    alter table public.attachments enable row level security;
    -- Replace basic owner-only policy with a safer superset: allow selects when owner_id = auth.uid()
    if not exists (select 1 from pg_policies where polname = 'attachments_select_owner_only') then
      create policy attachments_select_owner_only on public.attachments for select to authenticated using (owner_id = auth.uid());
    end if;
  end if;
end $$;

-- runtime_checkpoints: add helpful index for unique key lookups and recent updates
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='runtime_checkpoints') THEN
    CREATE INDEX IF NOT EXISTS idx_runtime_checkpoints_course_alias_key ON public.runtime_checkpoints(course_id, alias, key);
    CREATE INDEX IF NOT EXISTS idx_runtime_checkpoints_updated ON public.runtime_checkpoints(updated_at DESC);
  END IF;
END $$;
