-- Ensure single alias per (user_id, provider_id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_aliases') THEN
    CREATE UNIQUE INDEX IF NOT EXISTS uq_user_aliases_user_provider ON public.user_aliases(user_id, provider_id);
  END IF;
END $$;


