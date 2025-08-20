Stage Runbook (Runtime v2)

Pre-Flight
- Confirm envs (see env-matrix.md): Supabase URLs/keys, RUNTIME_API_V2=1, RS256 keys, RUNTIME_CORS_ALLOW, BASE_URL.
- Ensure TEST_MODE is unset in prod/stage.

Deploy
- Build and deploy web app to stage environment.
- Validate container health.

Smoke (cURL templates in runtime-stage-smoke.md)
1) Health: GET /api/health → 200, security headers present.
2) CORS: OPTIONS /api/runtime/progress with Origin=$ORIGIN → 204, allow-origin.
3) Auth exchange: POST /api/runtime/auth/exchange (Origin=$ORIGIN) → 200 runtimeToken.
4) Progress/Grade: POST with runtimeToken → 201; repeat with Idempotency-Key → 200 and idempotency-replayed.
5) Outcomes: POST /api/runtime/outcomes with provider-signed JWT → 201; 429 includes standard headers when limit hit.

Observability
- Confirm x-request-id present on responses; logs contain requestId.
- Validate rate-limit counters (if exported) and error counts.

Rollback
- Revert env or deployment to last known good.
- Disable RUNTIME_API_V2=0 if runtime issues; keep legacy flows unaffected.

Checklist (Quick)
- [ ] Env keys present and valid (RS256)
- [ ] CORS origin matches runtime aud
- [ ] Outcomes jwks_url reachable and correct kid
- [ ] Smoke steps pass



