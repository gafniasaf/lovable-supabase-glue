-- Per-user storage quotas (soft) and final indexes for receipts
DO $$
BEGIN
  -- message_read_receipts: helpful index by user and read_at
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='message_read_receipts') THEN
    CREATE INDEX IF NOT EXISTS idx_receipts_user_read ON public.message_read_receipts(user_id, read_at);
  END IF;

  -- Optional: user_storage_quotas table to track soft quotas
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_storage_quotas') THEN
    CREATE TABLE public.user_storage_quotas (
      user_id uuid PRIMARY KEY,
      max_bytes bigint NOT NULL DEFAULT 0,
      used_bytes bigint NOT NULL DEFAULT 0,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'quotas/index migration skipped: %', sqlerrm;
END $$;
