## Environment variables

See `docs/.env.example` for a full list. Key groups:

- Supabase client: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Test mode flags: `TEST_MODE`, `NEXT_PUBLIC_TEST_MODE`
- Security / CSP: `RUNTIME_FRAME_SRC_ALLOW`, optional `NEXT_PUBLIC_CSP`
- Runtime v2: `RUNTIME_API_V2`, `NEXT_RUNTIME_PUBLIC_KEY`, `NEXT_RUNTIME_PRIVATE_KEY`, `NEXT_RUNTIME_KEY_ID`
- Rate limits: `GLOBAL_MUTATION_RATE_LIMIT`, `GLOBAL_MUTATION_RATE_WINDOW_MS`, plus per-feature limits
- Jobs: `DUE_SOON_JOB`, `DATA_RETENTION_JOB` and related intervals/TTLs
- JWKS cache: `JWKS_TTL_MS`


