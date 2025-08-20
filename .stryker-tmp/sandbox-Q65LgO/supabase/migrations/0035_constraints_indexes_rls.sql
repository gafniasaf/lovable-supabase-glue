-- Constraints, indexes, and RLS tightening (coder B)

-- 1) Attachments: ensure object_key is unique (one logical file entry)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='attachments') THEN
    CREATE UNIQUE INDEX IF NOT EXISTS uq_attachments_object_key ON public.attachments(object_key);
  END IF;
END $$;

-- 2) Message read receipts: add index to speed lookups by user/message
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='message_read_receipts') THEN
    CREATE INDEX IF NOT EXISTS idx_mrr_user_message ON public.message_read_receipts(user_id, message_id);
  END IF;
END $$;

-- 3) Notifications: add sane RLS policies for read/update, and allow server inserts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='notifications') THEN
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    -- Read own notifications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'notifications_select_own') THEN
      CREATE POLICY notifications_select_own ON public.notifications
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
    END IF;
    -- Update own notifications (e.g., mark read)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'notifications_update_own') THEN
      CREATE POLICY notifications_update_own ON public.notifications
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
    END IF;
    -- Allow inserts from authenticated (server-side routes use anon+session cookies)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'notifications_insert_any_auth') THEN
      CREATE POLICY notifications_insert_any_auth ON public.notifications
      FOR INSERT TO authenticated
      WITH CHECK (true);
    END IF;
  END IF;
END $$;

-- 4) Events: allow server to insert app events; keep selects restricted (no explicit select policy)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='events') THEN
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'events_insert_any_auth') THEN
      CREATE POLICY events_insert_any_auth ON public.events
      FOR INSERT TO authenticated
      WITH CHECK (true);
    END IF;
  END IF;
END $$;


