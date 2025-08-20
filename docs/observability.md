# Observability

## Request tracing
- `x-request-id` propagated from middleware to handlers and echoed in responses.
- `withRouteTiming` logs latency and errors; metrics: `recordTiming`, `recordError`, in-flight counters per path.

## Events
- Emit domain events in services for create/update flows where relevant (assignments, submissions, quizzes, login). Store in `events` table.
- Budget checks: DAU/WAU, completion %, score trends; aggregate via reports endpoints.

## Metrics
- Rate-limit hits: `rate_limit.hit`
- CSRF fails: `csrf.fail`, `csrf.double_submit.fail`
- Job timings and counts via scheduler logs.

## Materialized views
- `user_course_progress_summary` drives progress KPIs. Keep fresh via scheduler (`REFRESH_PROGRESS_SUMMARY_JOB`).

## Dashboards
- Reports endpoints expose aggregate series for charts and CSV/JSON downloads. Ensure endpoints emit requestId and consistent error envelopes.
