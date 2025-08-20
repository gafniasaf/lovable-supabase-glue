-- Cache provider health checks to avoid repeated external calls
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='provider_health'
  ) THEN
    CREATE TABLE public.provider_health (
      provider_id uuid PRIMARY KEY REFERENCES public.course_providers(id) ON DELETE CASCADE,
      jwks_ok boolean NOT NULL DEFAULT false,
      domain_ok boolean NOT NULL DEFAULT false,
      jwks_error text NULL,
      domain_error text NULL,
      checked_at timestamptz NOT NULL DEFAULT now()
    );
  END IF;
  CREATE INDEX IF NOT EXISTS idx_provider_health_checked_at ON public.provider_health(checked_at DESC);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'provider_health cache migration skipped: %', sqlerrm;
END $$;


