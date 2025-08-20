# Runbook — CSRF Failures

Scope: 403 responses on non-GET routes due to Origin/Referer or double-submit token checks.

Symptoms:
- 403 Forbidden with message "CSRF check failed" or "Invalid CSRF token"
- Headers include x-request-id

Checks:
1) Confirm client sends Origin/Referer matching NEXT_PUBLIC_BASE_URL.
2) If CSRF_DOUBLE_SUBMIT=1, ensure cookie `csrf_token` exists and header `x-csrf-token` matches.
3) For runtime v2 endpoints (`/api/runtime/*`), same-origin checks are relaxed; ensure CORS allowlist is correct.

Mitigations:
- For trusted internal tools, disable double-submit temporarily by unsetting CSRF_DOUBLE_SUBMIT.
- Ensure proxies pass through Origin/Referer.

Observability:
- Metrics counters: `csrf.fail`, `csrf.double_submit.fail`.
- /api/admin/metrics exposes counts and percentiles.


