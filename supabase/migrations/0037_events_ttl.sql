-- Data retention: TTL/cleanup for events and interactive_attempts (configurable via env not supported in SQL)
-- Provide helper SQL for ops (manual or scheduled external job)

-- Create helper function to delete events older than N days
CREATE OR REPLACE FUNCTION public.delete_old_events(days_old int)
RETURNS void AS $$
BEGIN
  DELETE FROM public.events WHERE ts < (now() - make_interval(days => days_old));
END;
$$ LANGUAGE plpgsql;

-- Create helper function to delete interactive_attempts older than N days when not linked to assignment_id
CREATE OR REPLACE FUNCTION public.delete_old_interactive_attempts(days_old int)
RETURNS void AS $$
BEGIN
  DELETE FROM public.interactive_attempts WHERE created_at < (now() - make_interval(days => days_old)) AND assignment_id IS NULL;
END;
$$ LANGUAGE plpgsql;


