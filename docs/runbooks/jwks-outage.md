# Runbook — JWKS Outage Handling

Scope: Provider JWKS unavailability affecting runtime outcomes and provider validation.

Symptoms:
- 403 Forbidden on POST /api/runtime/outcomes (Invalid provider token)
- Metrics counter jwks.verify_fail increases
- Health: /api/providers/health?id=... shows jwks_ok=false

Immediate Actions:
1) Verify provider domain and JWKS URL are reachable (curl, browser).
2) Check rate limits and timeouts (PROVIDER_HEALTH_TIMEOUT_MS, RUNTIME_OUTCOMES_WINDOW_MS).
3) Increase JWKS TTL temporarily if flapping (JWKS_TTL_MS), or lower to force refresh after provider rotation.
4) If provider rotated keys, confirm `kid` and algorithm match expectations (RS256).

Mitigations:
- Retry outcomes ingestion later (idempotency at provider side recommended).
- Coordinate with provider to restore JWKS endpoint.
- If necessary, temporarily disable outcomes ingestion (feature flag) until JWKS recovers.

Observability:
- Monitor jwks.verify_fail counter.
- Use /api/admin/metrics for route error counts.
- /api/providers/health reports cached status; invalidate by adjusting TTL env or updating provider record.

Postmortem:
- Document root cause, duration, metrics.
- Consider adding warm-up checks or fallback cache for recent valid keys with expiry.
