# Runbook — Rate Limit Tuning

Scope: 429 responses on endpoints with per-user or per-IP limits.

Symptoms:
- 429 Too Many Requests with headers: retry-after, x-rate-limit-remaining, x-rate-limit-reset

Actions:
1) Identify route and key causing throttles (logs include path, counters in /api/admin/metrics).
2) Adjust envs for the route:
   - Messages: MESSAGES_LIMIT / MESSAGES_WINDOW_MS, MESSAGES_LIST_LIMIT / MESSAGES_LIST_WINDOW_MS
   - Submissions create: SUBMISSIONS_CREATE_LIMIT / SUBMISSIONS_CREATE_WINDOW_MS
   - Grading: GRADING_LIMIT / GRADING_WINDOW_MS
   - Files upload: UPLOAD_RATE_LIMIT / UPLOAD_RATE_WINDOW_MS
   - Providers health: PROVIDER_HEALTH_LIMIT / PROVIDER_HEALTH_WINDOW_MS
   - Registry lists/mutations: REGISTRY_LIST_LIMIT / REGISTRY_LIST_WINDOW_MS, REGISTRY_MUTATE_LIMIT / REGISTRY_MUTATE_WINDOW_MS
   - Global mutations: GLOBAL_MUTATION_RATE_LIMIT / GLOBAL_MUTATION_RATE_WINDOW_MS
3) Validate headers after change and monitor errors.

Notes:
- Keep conservative defaults in production.
- Prefer per-user limits over global IP when feasible.
