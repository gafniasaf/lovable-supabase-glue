-- Helpful indexes for pagination paths and TTL cleanup for large telemetry/events
DO $$
BEGIN
  -- Index created_at on common list tables if they exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='announcements') THEN
    CREATE INDEX IF NOT EXISTS idx_announcements_created ON public.announcements(created_at DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='assignments') THEN
    CREATE INDEX IF NOT EXISTS idx_assignments_created ON public.assignments(created_at DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='submissions') THEN
    CREATE INDEX IF NOT EXISTS idx_submissions_submitted ON public.submissions(submitted_at DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='messages') THEN
    CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON public.messages(thread_id, created_at ASC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='notifications') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='lessons') THEN
    CREATE INDEX IF NOT EXISTS idx_lessons_course_order ON public.lessons(course_id, order_index ASC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='modules') THEN
    CREATE INDEX IF NOT EXISTS idx_modules_course_order ON public.modules(course_id, order_index ASC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='enrollments') THEN
    CREATE INDEX IF NOT EXISTS idx_enrollments_student_created ON public.enrollments(student_id, created_at DESC);
  END IF;
END $$;

-- TTL cleanup function for course_events (large telemetry)
CREATE OR REPLACE FUNCTION public.cleanup_old_events(retain_days integer DEFAULT 30)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='course_events') THEN
    EXECUTE format('DELETE FROM public.course_events WHERE ts < now() - interval ''%s days''', retain_days);
  END IF;
END;
$$;

-- Optional schedule via pg_cron (if present), commented out for portability
-- SELECT cron.schedule('events_cleanup_daily', '5 3 * * *', $$SELECT public.cleanup_old_events(30);$$);


