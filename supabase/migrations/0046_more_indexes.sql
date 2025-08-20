-- Additional helpful indexes for common backend queries
DO $$
BEGIN
  -- attachments: lookup by owner and object_key used during finalize/download
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='attachments') THEN
    CREATE INDEX IF NOT EXISTS idx_attachments_owner ON public.attachments(owner_type, owner_id);
    CREATE INDEX IF NOT EXISTS idx_attachments_object_key ON public.attachments(object_key);
  END IF;
  -- interactive_attempts: course/user recent queries
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='interactive_attempts') THEN
    CREATE INDEX IF NOT EXISTS idx_interactive_attempts_course_user ON public.interactive_attempts(course_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_interactive_attempts_course_ts ON public.interactive_attempts(course_id, created_at DESC);
  END IF;
  -- user_storage_quotas: frequent upserts and selects by user
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_storage_quotas') THEN
    CREATE INDEX IF NOT EXISTS idx_user_storage_quotas_user ON public.user_storage_quotas(user_id);
  END IF;
END $$;


