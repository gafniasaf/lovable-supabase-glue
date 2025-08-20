-- Messages/participants/messages RLS and indexes; events/notifications RLS
DO $$
BEGIN
  -- message_threads: only participants can select
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='message_threads' AND table_schema='public') THEN
    ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='message_threads_select_participant') THEN
      CREATE POLICY message_threads_select_participant ON public.message_threads
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.message_thread_participants p WHERE p.thread_id = message_threads.id AND p.user_id = auth.uid()
        )
      );
    END IF;
  END IF;
  -- message_thread_participants: participants can see membership for threads they are in
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='message_thread_participants' AND table_schema='public') THEN
    ALTER TABLE public.message_thread_participants ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='message_participants_select_participant') THEN
      CREATE POLICY message_participants_select_participant ON public.message_thread_participants
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.message_thread_participants p WHERE p.thread_id = message_thread_participants.thread_id AND p.user_id = auth.uid()
        )
      );
    END IF;
    -- Helpful index
    CREATE INDEX IF NOT EXISTS idx_message_participants_thread_user ON public.message_thread_participants(thread_id, user_id);
  END IF;
  -- messages: only participants can see messages of their threads
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='messages' AND table_schema='public') THEN
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='messages_select_participant') THEN
      CREATE POLICY messages_select_participant ON public.messages
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.message_thread_participants p WHERE p.thread_id = messages.thread_id AND p.user_id = auth.uid()
        )
      );
    END IF;
    CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON public.messages(thread_id, created_at DESC);
  END IF;
  -- notifications: owner-only select
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='notifications' AND table_schema='public') THEN
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='notifications_select_owner') THEN
      CREATE POLICY notifications_select_owner ON public.notifications
      FOR SELECT TO authenticated USING (user_id = auth.uid());
    END IF;
    -- unread partial index added earlier; ensure created index exists
    CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
  END IF;
  -- events: read access limited to admins for now (or owner if user_id matches)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='events' AND table_schema='public') THEN
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='events_select_owner_or_admin') THEN
      CREATE POLICY events_select_owner_or_admin ON public.events
      FOR SELECT TO authenticated
      USING (
        -- Allow admins or owner
        EXISTS (SELECT 1 FROM public.profiles pr WHERE pr.id = auth.uid() AND pr.role = 'admin') OR user_id = auth.uid()
      );
    END IF;
    CREATE INDEX IF NOT EXISTS idx_events_user_ts ON public.events(user_id, ts DESC);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'messages/events rls/index migration skipped: %', sqlerrm;
END $$;
