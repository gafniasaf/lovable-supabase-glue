-- Ensure message_read_receipts are idempotent: unique per (message_id, user_id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='message_read_receipts') THEN
    CREATE UNIQUE INDEX IF NOT EXISTS uq_mrr_message_user ON public.message_read_receipts(message_id, user_id);
  END IF;
END $$;


