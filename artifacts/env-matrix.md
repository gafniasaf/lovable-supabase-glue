Environment Matrix (Backend)

Core
- NEXT_PUBLIC_BASE_URL: Base URL (https in prod). Used by serverFetch, health.
- NEXT_PUBLIC_SUPABASE_URL: Supabase project URL (https in prod; required in prod).
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon key (required in prod).
- TEST_MODE: '1' enables test helpers/middleware allowances (must be unset in prod).

Runtime v2
- RUNTIME_API_V2: '1' enables runtime endpoints.
- INTERACTIVE_RUNTIME: '1' to enable related legacy paths where applicable.
- NEXT_RUNTIME_PUBLIC_KEY: PEM RS256 public key (required in prod if RUNTIME_API_V2=1).
- NEXT_RUNTIME_PRIVATE_KEY: PEM RS256 private key (required in prod if RUNTIME_API_V2=1).
- NEXT_RUNTIME_KEY_ID: Key id for RS256 (required in prod if RUNTIME_API_V2=1).
- NEXT_RUNTIME_SECRET: Dev HS256 secret (dev/test only; not used in prod).

CORS/CSP
- RUNTIME_CORS_ALLOW: comma-separated origins for runtime API allowlist.
- RUNTIME_FRAME_SRC_ALLOW: comma-separated frame-src allowlist appended to CSP when NEXT_PUBLIC_CSP is unset.
- NEXT_PUBLIC_CSP: explicit CSP string (must include connect-src/frame-src for provider origin if set).
- COEP: '1' sets Cross-Origin-Embedder-Policy: require-corp.

CSRF & Security
- CSRF_DOUBLE_SUBMIT: '1' enables x-csrf-token + cookie matching for unsafe methods.
- GLOBAL_MUTATION_RATE_LIMIT: global per-IP limit (mutations), e.g., '60'.
- GLOBAL_MUTATION_RATE_WINDOW_MS: window ms for global mutation limit.

Files/Storage
- NEXT_PUBLIC_UPLOAD_BUCKET: Supabase Storage bucket (default: public).
- ALLOWED_UPLOAD_MIME: csv of allowed MIME types for uploads/signing.
- STORAGE_QUOTA_ENABLED: '1' to enforce per-user quotas.
- UPLOAD_MAX_BYTES: max single-object size (bytes) when quota enabled.

Runtime Limits (per-alias/course)
- RUNTIME_PROGRESS_LIMIT, RUNTIME_PROGRESS_WINDOW_MS
- RUNTIME_GRADE_LIMIT, RUNTIME_GRADE_WINDOW_MS
- RUNTIME_EVENTS_LIMIT, RUNTIME_EVENTS_WINDOW_MS
- RUNTIME_ASSET_LIMIT, RUNTIME_ASSET_WINDOW_MS
- RUNTIME_IDEMPOTENCY_TTL_MS: optional override for idempotency key TTL.

Messaging/Notifications Limits
- MESSAGES_LIST_LIMIT, MESSAGES_LIST_WINDOW_MS
- MESSAGES_LIMIT, MESSAGES_WINDOW_MS (read receipts)
- NOTIFICATIONS_LIST_LIMIT, NOTIFICATIONS_LIST_WINDOW_MS

Registry/Providers/Admin
- EXTERNAL_COURSES: '1' enables registry endpoints.
- REGISTRY_LIST_LIMIT, REGISTRY_LIST_WINDOW_MS
- REGISTRY_MUTATE_LIMIT, REGISTRY_MUTATE_WINDOW_MS
- PROVIDER_HEALTH_LIMIT, PROVIDER_HEALTH_WINDOW_MS
- PROVIDER_HEALTH_TTL_MS: cache TTL for provider health rows.
- PROVIDER_HEALTH_TIMEOUT_MS: per-request timeout for health checks.

Jobs (optional)
- PROVIDER_HEALTH_REFRESH_JOB, PROVIDER_HEALTH_REFRESH_INTERVAL_MS
- QUOTA_RECONCILE_JOB, QUOTA_RECONCILE_INTERVAL_MS
- BACKFILL_ATTACHMENT_SIZES_JOB, BACKFILL_ATTACHMENT_SIZES_INTERVAL_MS

Observability
- METRICS_TOKEN: optional token for metrics endpoints.
- LOG_LEVEL: pino log level (default debug in dev, info in prod).
- PINO_PRETTY: '1' pretty logs in dev.

Redis (optional)
- REDIS_URL: enables distributed idempotency/rate-limits.



