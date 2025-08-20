-- Add size_bytes to attachments to support quota accounting
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='attachments') THEN
    BEGIN
      ALTER TABLE public.attachments ADD COLUMN IF NOT EXISTS size_bytes bigint NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'attachments size_bytes migration skipped: %', sqlerrm;
END $$;


