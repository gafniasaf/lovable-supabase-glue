### Integrating Lovable‑built Courses

This guide lists the minimal configuration to allow courses built on Lovable (static/SPAs) to integrate via our Runtime API.

## Platform config (ours)
- Enable runtime:
  - `INTERACTIVE_RUNTIME=1`
  - `RUNTIME_API_V2=1`
- CORS allowlist (Lovable origins):
  - `RUNTIME_CORS_ALLOW=https://your-dev.example,https://your-stage.example,https://your-prod.example`
- CSP frame/connect:
  - If using default CSP, extend with:
    - `RUNTIME_FRAME_SRC_ALLOW=https://your-dev.example,https://your-stage.example,https://your-prod.example`
  - If using a custom CSP (`NEXT_PUBLIC_CSP`), include those origins in `frame-src` and optionally `connect-src`.

## Course config (in our LMS)
- `launch_kind=WebEmbed`
- `launch_url=https://your-prod.example/path` (dev/stage allowed in non‑prod)
- `scopes`: `progress.write`, `attempts.write` (add `files.read`/`files.write` only if needed)
- `provider_id`: only if using webhooks

## Vendor requirements (Lovable side)
- Allow embedding by our LMS (no `X-Frame-Options: DENY`; `frame-ancestors` must allow our domain — set at host if needed).
- SPA fallback at host (404→index.html).
- Read `?token` from `launch_url` and exchange for `runtimeToken`, or consume `postMessage` with `{ type: 'runtime.token' }`.
- Use only standardized signals:
  - Progress: `{ pct, topic? }`
  - Grade: `{ score, max, passed, runtimeAttemptId? }`
  - Optional events: `course.ready`, `course.progress`, `course.attempt.completed`, `course.error`
  - Use checkpoints for small JSON state (~32 KB), throttled
- Webhooks (optional):
  - Host `jwks.json` (static) and sign RS256 in serverless (e.g., Supabase Edge Function)
  - Only `attempt.completed` and `progress` event types; extra analytics in `event.raw` (no PII)

## Ops checklist
- [ ] Set envs: `INTERACTIVE_RUNTIME=1`, `RUNTIME_API_V2=1`
- [ ] Set `RUNTIME_CORS_ALLOW` to include vendor origins
- [ ] Extend CSP: either `RUNTIME_FRAME_SRC_ALLOW` or update `NEXT_PUBLIC_CSP`
- [ ] Confirm rate limits are acceptable; 429 returns `retry-after`
- [ ] If webhooks: register provider (`name`, `domain`, `jwks_url`)

## Troubleshooting
- 403 on `/api/runtime/*` with Bearer:
  - Check origin is in `RUNTIME_CORS_ALLOW`
  - Ensure runtime token `aud` matches request origin
  - Verify scopes (`progress.write` for progress, `attempts.write` for grade)
- Iframe blocked:
  - Add vendor origin to `frame-src` via CSP or `RUNTIME_FRAME_SRC_ALLOW`
  - Ensure vendor host allows embedding (frame-ancestors)
- Outcomes rejected:
  - Verify RS256 JWT against provided `jwks_url`; check `Authorization: Bearer` is present


