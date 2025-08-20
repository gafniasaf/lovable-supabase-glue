## Observability

### Metrics
- Timings: per-route p50, p95, p99 (rolling window of 1000 samples)
- Errors: per-route error count
- Custom counters: `jwks.verify_fail`, `rate_limit.hit`, `csrf.fail`, `csrf.double_submit.fail`, `job.<name>.runs`, `job.<name>.ms`, `job.<name>.errors`

Endpoints:
- GET `/api/admin/metrics` returns `{ timings, counters }` (sends Prometheus text when `Accept: text/plain`)
- GET `/api/internal/metrics` returns Prometheus text and requires `x-metrics-token: $METRICS_TOKEN`

Alerts:

Prometheus scrape example:

```yaml
scrape_configs:
  - job_name: education-web
    metrics_path: /api/internal/metrics
    static_configs:
      - targets: [app.example.com]
    scheme: https
    authorization:
      credentials: ${METRICS_TOKEN}
    http_headers:
      - name: x-metrics-token
        value: ${METRICS_TOKEN}
```

SLOs (initial targets):
- Dashboard p95 < 800ms, p99 < 1500ms
- API health p95 < 200ms
- Error rate < 0.5% per route over 5m window
- Scheduled workflow runs `scripts/metrics-alert.js` against your `BASE_URL` (`CONTRACT_BASE_URL` secret). It fails the run if p95 budgets are exceeded or any route reports errors. Optionally posts to Slack (`SLACK_WEBHOOK_URL`).

### Logging
- Pino logger with pretty option via `PINO_PRETTY=1`
- Redacts sensitive headers and common secrets
- `withRouteTiming` logs `route_success`/`route_error` with `requestId` and `ms`; tracks per-route in-flight saturation

### Tracing
- `x-request-id` generated/propagated by middleware; echoed by handlers

### Health
- GET `/api/health` includes DB and storage checks, flags, version

### Observability

#### Request IDs

- `apps/web/middleware.ts` ensures an incoming `x-request-id` is preserved or generates one. The same ID is then available to route handlers.
- `withRouteTiming` and `createApiHandler` both read the upstream `x-request-id`, attach it to logs, and set it on responses.
- All error responses include `{ requestId }` in the JSON envelope.

#### Route timing & CSRF

- `withRouteTiming(handler)` wraps a route handler/function to measure duration and log outcome.
- It also enforces basic CSRF Origin/Referer checks on non-GET/HEAD routes and optional global mutation rate limits.

```ts
export const GET = withRouteTiming(async function GET() { /* ... */ });
```

Logs (Pino) include fields:

- `requestId`: correlation id
- `dev`: developer id (`DEV_ID`) in dev/test
- `branch`: Vercel/GitHub ref
- `commit`: Vercel/GitHub SHA
- `ms`: elapsed milliseconds
- message: `route_success` or `route_error`

Metrics (planned/initial):
- Initial: in-memory metrics collector (`apps/web/src/lib/metrics.ts`) with `GET /api/admin/metrics` snapshot (count, p50, p95, errors per route).
- Next: export per-endpoint latency p50/p95, error rate, saturation to a central backend.
- Background jobs: job duration, attempt counts, queue depth; propagate `requestId`.

Service logs:
- `dash_teacher_widgets`, `dash_student_widgets`, `dash_admin_widgets`: timing for dashboard assembly per role
- `progress_marked`: emitted on lesson completion ({ userId, lessonId, ms })
- `runtime_event_received`: on runtime events (course.progress, course.attempt.completed) with `{ requestId, courseId, type }`
- `runtime_outcome_saved`: on provider outcomes webhook with `{ requestId, courseId, userId, kind }`

#### Logger configuration

- Pretty-print locally by setting `PINO_PRETTY=1` (dev dependency `pino-pretty` is installed)
- Control level via `LOG_LEVEL` (`debug` in dev, `info` in prod by default)

#### SSR header forwarding & rate limiting

- Use `serverFetch(path, init)` from `apps/web/src/lib/serverFetch.ts`. It forwards `x-request-id` and `x-test-auth` from the SSR context so API routes receive the same correlation id and test-mode role.
- Global per-IP mutation rate limits can be enabled via `GLOBAL_MUTATION_RATE_LIMIT` and `GLOBAL_MUTATION_RATE_WINDOW_MS` to protect non-GET endpoints.

---

### Cross-service observability (future services)

- Propagate `x-request-id` across service boundaries and background jobs. Include `service` and `route` fields in logs.
- Track per-service SLOs (latency percentiles, error rate, saturation). Export metrics to a central backend.
- For background jobs, log `jobId`, `attempt`, and `requestId`; emit duration metrics per job type.
- Add rate-limit logs for messaging/notifications to detect abuse and back-pressure.

Redaction:
- Configure logger to redact PII fields (emails, message bodies) and secrets in production logs.
