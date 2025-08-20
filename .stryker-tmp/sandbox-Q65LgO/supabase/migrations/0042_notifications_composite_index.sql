-- Composite index to support unread counts and recency queries
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='notifications') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_user_created_read ON public.notifications(user_id, created_at DESC, read_at);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'notifications composite index migration skipped: %', sqlerrm;
END $$;


