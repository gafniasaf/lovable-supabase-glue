# Backend readiness

## Materialized view refresh
- `user_course_progress_summary` summarizes per-user, per-course completion.
- Refresh job (optional) via env:
  - `REFRESH_PROGRESS_SUMMARY_JOB=1`
  - `REFRESH_PROGRESS_SUMMARY_INTERVAL_MS` (default 5m)
- Scheduler attempts `rpc('refresh_user_course_progress_summary')`, otherwise no-op.

## Schedulers
- Assignments due soon:
  - `DUE_SOON_JOB=1`, `DUE_SOON_INTERVAL_MS`, `DUE_SOON_WINDOW_HOURS`
- Data retention (notifications/read receipts):
  - `DATA_RETENTION_JOB=1`, `NOTIFICATIONS_TTL_MS`, `RECEIPTS_TTL_MS`, `DATA_RETENTION_INTERVAL_MS`
- Provider health cache:
  - `PROVIDER_HEALTH_REFRESH_JOB=1`, `PROVIDER_HEALTH_REFRESH_INTERVAL_MS`, `PROVIDER_HEALTH_TIMEOUT_MS`
- Storage quotas:
  - `QUOTA_RECONCILE_JOB=1`, `QUOTA_RECONCILE_INTERVAL_MS`
  - `BACKFILL_ATTACHMENT_SIZES_JOB=1`, `BACKFILL_ATTACHMENT_SIZES_INTERVAL_MS`

## Guards
- Production must not set `TEST_MODE`. `x-test-auth` ignored/denied.
- Wrap all non-GET routes with `withRouteTiming`/`createApiHandler` to enforce CSRF/rate-limits.


