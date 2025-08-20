# ADR 0002: Interactive Course Integration

## Status
Accepted

## Context
We support standalone courses; we now need cloud-hosted, interactive runtimes (games, simulations, rich web apps) that launch from the LMS and exchange progress/scores in real time.

## Decision
- Extend `courses` with `launch_kind`, `launch_url`, `scopes[]`, `provider_id`.
- Introduce `course_providers` and `interactive_attempts`.
- Add `POST /api/enrollments/:id/launch-token` to mint short-lived JWTs.
- WebEmbed (iframe + postMessage) as first release. Runtime sends standardized events; LMS persists outcomes. Provider webhook `/api/runtime/outcomes` for server-to-server results.
- Security: iframe sandbox, origin checks, JWT ≤10m, one-time use (future), JWS (RS256) with platform private key (future).

## Consequences
- UI: course form fields; lesson player renders iframe for interactive blocks.
- Observability: log runtime events and outcomes; correlate via requestId and nonce.
- Backward-compatible with static blocks.

## Minimal Targets
1) WebEmbed only
2) Launch token and validation
3) Receive and store `course.progress` and `course.attempt.completed`
4) Teacher dashboard surfaces interactive attempts
5) Token nonce persisted and enforceable as one-time-use (table `interactive_launch_tokens`)


## Next Steps (Post‑MVP Expansion) — Status Update

- Runtime API v2: Implemented core endpoints with bearer runtime token and origin-bound audience
  - `POST /api/runtime/auth/exchange` — implemented
  - `GET /api/runtime/context` — implemented
  - `POST /api/runtime/progress` — implemented
  - `POST /api/runtime/grade` — implemented
  - `POST /api/runtime/events` — implemented with runtime bearer auth, scopes, and rate limits
  - `POST /api/runtime/checkpoint/save` and `GET /api/runtime/checkpoint/load` — implemented (JSON snapshots, size-limited)
  - `POST /api/runtime/asset/sign-url` — implemented (scope-checked, presigned uploads)

- Security:
  - RS256 JWS for tokens in production; `aud` bound to provider origin; one‑time nonce use; CSP `frame-src` dynamically includes provider origin
  - PII minimization via per‑provider aliases (no real user UUIDs exposed without consent)

- Data model extensions:
  - Implemented: `external_courses`, `course_versions`, `assignment_targets`, `user_aliases`, `course_events`, `runtime_checkpoints`

- Governance & reliability (later):
  - Dead‑letter queue and replay; quotas/usage counters; version pinning/rollback; licensing/seats; vendor portal and conformance harness

