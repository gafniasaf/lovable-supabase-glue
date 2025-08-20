### Runtime API v2 — Integration Guide (Draft)

This document describes how external v2 courses (web apps) integrate with the platform using a minimal, stable contract.

Prerequisites:
- Flags: `INTERACTIVE_RUNTIME=1`, `RUNTIME_API_V2=1`
- CSP: allow provider origin via `NEXT_PUBLIC_CSP` or `RUNTIME_FRAME_SRC_ALLOW`
- CORS: set `RUNTIME_CORS_ALLOW=https://your-course-origin` if calling APIs cross-origin

Flow:
1) Launch: LMS renders an iframe with `?token=<launch JWT>` or calls your launch URL with a POST containing the token.
2) Exchange: Your runtime calls `POST /api/runtime/auth/exchange` with `{ token }`.
   - Returns `{ runtimeToken, expiresAt }` — short-lived, origin-bound JWT.
3) Context: Call `GET /api/runtime/context` with `Authorization: Bearer <runtimeToken>`.
   - Response: `{ alias, role, courseId, assignmentId?, scopes[] }`.
4) Progress & Grade:
   - `POST /api/runtime/progress` with `{ pct, topic? }`
   - `POST /api/runtime/grade` with `{ score, max, passed, runtimeAttemptId? }`
5) Events (optional): `POST /api/runtime/events` `{ type, ... }` with Bearer runtime token.
6) Checkpoints (optional): `POST /api/runtime/checkpoint/save` `{ key, state }`; `GET /api/runtime/checkpoint/load?key=` (Bearer runtime token). Small JSON only, default max ~32KB.
7) Assets (optional): `POST /api/runtime/asset/sign-url` `{ content_type, filename? }` with Bearer runtime token; returns a short-lived presigned upload URL (PUT) and headers.

Security:
- Tokens use RS256 in production with audience bound to provider origin.
- Pseudonymous alias per provider; student UUIDs are not exposed to runtimes.
- Rate limits applied per alias/course/provider; runtime token `aud` must match request origin for CORS.
- Responses and preflights include `Vary: Origin` for correct per-origin caching.
- JWKS TTL (`JWKS_TTL_MS`, default 5m). On verification failure, the JWKS cache is refreshed once to tolerate rotation.
- Clock skew tolerance via `RUNTIME_CLOCK_SKEW_S` (default 60s).

Local dev:
- In development/TEST_MODE, HS256 fallback is allowed; nonce/alias checks are relaxed.
- Set `NEXT_RUNTIME_SECRET` and `RUNTIME_CORS_ALLOW=http://localhost:5173` (your dev origin).

Readiness vs Health:
- `/api/ready` is a lightweight readiness probe checking environment presence.
- `/api/health` performs DB/storage/provider checks and reports flags and required envs.


