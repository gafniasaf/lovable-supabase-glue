### ADR 0003 — Response DTO validation on all 2xx

Status: Accepted

Date: 2025-08-20

#### Context

To ensure consistent client contracts and observability, all REST endpoints should validate 2xx JSON responses against shared Zod DTOs and echo `x-request-id` on success in addition to error paths. Several routes already validate request DTOs and some validate response DTOs (e.g., dashboard, runtime attempts). This ADR standardizes the practice across the API surface.

#### Decision

- Adopt a helper (`jsonDto(data, schema, { requestId, status })`) that:
  - `safeParse`s the output against the provided Zod schema
  - Logs redacted issues with the current `requestId`
  - Returns 500 with an error envelope on validation failure
  - Returns 2xx with `x-request-id` header on success
- Apply to all 2xx JSON responses in core domains; CSV/binary endpoints remain as-is.
- Continue to set pagination headers (e.g., `x-total-count`) as needed after invoking the helper.

#### Consequences

- Clients receive consistent, validated payloads on 2xx and can rely on `x-request-id` for tracing.
- Server logs capture DTO validation failures with redacted issue summaries.

#### Work

- Implemented `apps/web/src/lib/jsonDto.ts`.
- Applied in routes: courses, lessons, enrollments, assignments, submissions, modules, messages, notifications, messages/threads, providers (health, summaries), registry/courses, registry/versions, quizzes, quiz-questions, dashboard, runtime (context, progress, grade, events, event, asset/sign-url, checkpoint save/load, auth/exchange, teacher/outcomes), files (download-url, upload-url, resolve, attachment), reports (engagement, grade-distribution), admin (metrics, export, quotas, audit-logs), users and user/profile, announcements, flags, health, lessons/reorder, test utilities.
- CSV/binary endpoints still return their native formats with `x-request-id` set.

#### References

- `docs/api.md` response DTOs list
- `apps/web/src/lib/jsonDto.ts`


