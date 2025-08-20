### Backend hardening and readiness (Coder B)

This document summarizes the backend/API/DB hardening completed in this pass and what remains. It is intended for future backend maintainers (Coder B successors).

Completed (high impact)
- Contracts and validation
  - Zod validation on bodies and queries across routes; standardized error envelope and `x-request-id` echo.
  - Added query parsing with `parseQuery` to eliminate ad-hoc `URLSearchParams` reads.
- Pagination and counts
  - `x-total-count` headers added and/or DB count enabled for: messages list, notifications list, runtime outcomes (course and teacher), threads list, lessons, modules, assignments, submissions, quizzes, enrollments.
- Rate limits
  - Per-user rate limits added to destructive endpoints: quizzes DELETE, modules DELETE, announcements DELETE, assignments DELETE; existing limits on messages and notifications.
- Audit logging
  - Providers create/update/delete; course transfer-owner; announcement delete; user role updates now write to `audit_logs`.
- Runtime v2 security
  - Audience binding (`aud` must match request origin when allowed by env) enforced in context/progress/grade/checkpoint save+load/asset sign.
  - Scope checks enforced: `progress.write/read`, `attempts.write/read`, `files.write` as applicable.
  - RS256 preferred; HS256 permitted only in non-prod.
- DB RLS and indexes
  - Messages: participant-only select on threads/participants/messages; indexes on `(thread_id, created_at)` and `(thread_id, user_id)`.
  - Notifications: owner-only select; partial index for unread (and user/created_at).
  - Events: owner-or-admin select; index `(user_id, ts)`.
  - Attachments: owner-only select; indexes on `object_key` and `(owner_type, owner_id)`.
  - Runtime checkpoints: select/update limited to course teachers; indexes `(course_id, alias, key)` and `updated_at`.
  - Interactive attempts: index `(course_id, created_at desc)`.
- Files
  - Test-mode upload PUT validated via Zod; MIME allowlist enforced; size caps in test-mode.
- Documentation
  - `docs/api.md` updated with new endpoints, pagination headers, runtime security notes; files endpoints documented.

Migrations added
- 0030_announcements_indexes.sql — `announcements` indexes
- 0031_attachments_notifications_indexes.sql — attachments/notifications indexes
- 0032_interactive_attempts_indexes.sql — outcomes read index
- 0033_rls_hardening.sql — attachments owner-only + runtime_checkpoints indexes
- 0034_runtime_checkpoints_rls_tighten.sql — restrict checkpoints to course teachers
- 0035_messages_events_rls_indexes.sql — messages/participants/events RLS + indexes
- 0044_receipts_unique_idempotent.sql — unique index for message read receipts to make mark-read idempotent

Remaining (prioritized)
1) RLS/constraints sweep
   - Confirm inserts are server-only where intended; consider service role for runtime webhooks.
   - Add `message_read_receipts(user_id, message_id)` unique or supporting index.
2) Pagination consistency
   - Verify all minor list endpoints (registry search, providers list) implement `offset`/`limit` and set `x-total-count`.
3) Rate limits
   - Added per-user limits to parent-links CRUD and providers health; consider caps for other admin read endpoints.
4) Runtime v2
   - Fail-fast on missing RS256 keys in prod when `RUNTIME_API_V2=1`; document expected envs.
5) Env validation
   - Extend startup validation for CSP, CORS, rate-limit knobs; fail-fast in prod.
6) Jobs/retention
   - Implement `DUE_SOON_JOB` fanout; TTL/cleanup for `events` and large telemetry tables.
7) Docs
   - Finish API docs for all runtime v2 endpoints with aud/scope notes; document paging parameters for all list endpoints.


