-- RPC to sum attachment sizes per owner for quota reconciliation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc JOIN pg_namespace n ON n.oid = pg_proc.pronamespace
    WHERE proname = 'sum_attachment_sizes_by_owner' AND n.nspname = 'public'
  ) THEN
    CREATE OR REPLACE FUNCTION public.sum_attachment_sizes_by_owner(owner uuid)
    RETURNS TABLE(sum bigint)
    LANGUAGE sql
    AS $$
      SELECT COALESCE(SUM(size_bytes), 0)::bigint AS sum
      FROM public.attachments
      WHERE owner_id = owner AND size_bytes IS NOT NULL;
    $$;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'RPC creation skipped: %', sqlerrm;
END $$;


