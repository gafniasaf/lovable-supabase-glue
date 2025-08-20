### API Reference

Base URL is the web app origin. In test-mode, Playwright may set `PLAYWRIGHT_BASE_URL`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/health | Public | Health/status with test-mode flags |
| GET | /api/dashboard | Auth | Role-aware dashboard summary |
| POST | /api/auth/logout | Auth | Sign out current session |
| GET | /api/user/profile | Auth | Get current user's profile |
| PUT | /api/user/profile | Auth | Update current user's profile |
| PATCH | /api/user/role | Admin | Update a user's role |
| POST | /api/courses | Teacher | Create a course |
| GET | /api/courses | Teacher | List teacher's courses |
| PATCH | /api/courses/[id] | Teacher | Update a course |
| DELETE | /api/courses/[id] | Teacher | Delete a course |
| POST | /api/lessons | Teacher | Create a lesson |
| GET | /api/lessons?course_id | Authenticated | List lessons for a course |
| POST | /api/lessons/complete | Student | Mark a lesson complete |
| POST | /api/modules | Teacher | Create a module |
| GET | /api/modules?course_id | Teacher | List modules for a course |
| PATCH | /api/modules?id | Teacher | Update a module |
| DELETE | /api/modules?id | Teacher | Delete a module |
| POST | /api/enrollments | Student | Enroll current student |
| GET | /api/enrollments?offset&limit | Authenticated | List current student's enrollments (paged; returns `x-total-count`) |
| POST | /api/assignments | Teacher | Create an assignment |
| GET | /api/assignments?course_id&offset&limit | Authenticated | List assignments for a course (paged; returns `x-total-count`) |
| PATCH | /api/assignments?id | Teacher | Update an assignment |
| DELETE | /api/assignments?id | Teacher | Delete an assignment |
| POST | /api/submissions | Student | Create a submission |
| GET | /api/submissions?assignment_id&offset&limit | Authenticated | List submissions for an assignment (paged; returns `x-total-count`) |
| PATCH | /api/submissions?id | Teacher | Grade a submission |
| POST | /api/quizzes | Teacher | Create a quiz |
| GET | /api/quizzes?course_id&offset&limit | Authenticated | List quizzes for a course (paged; returns `x-total-count`) |
| PATCH | /api/quizzes?id | Teacher | Update a quiz |
| DELETE | /api/quizzes?id | Teacher | Delete a quiz |
| POST | /api/quiz-questions | Teacher | Create a quiz question |
| GET | /api/quiz-questions?quiz_id | Authenticated | List questions for a quiz |
| POST | /api/quiz-choices | Teacher | Create a quiz choice |
| GET | /api/quiz-choices?question_id | Authenticated | List choices for a question |
| POST | /api/quiz-attempts | Student | Start a quiz attempt |
| PATCH | /api/quiz-attempts | Student | Upsert an answer |
| POST | /api/quiz-attempts/submit | Student | Submit an attempt |
| GET | /api/quiz-attempts?quiz_id | Teacher | List attempts for a quiz |
| POST | /api/enrollments/[id]/launch-token | Auth | Mint interactive course launch token |
| POST | /api/runtime/auth/exchange | Auth | Exchange a transient token for a short-lived runtime bearer |
| POST | /api/runtime/outcomes | Provider | Submit interactive outcomes |
| POST | /api/runtime/events | Runtime Bearer | Runtime v2 events (progress/attempt.completed). Enforces scopes and rate limits. CORS allowed via env. |
| POST | /api/runtime/event | Runtime Bearer | Runtime v2 generic events recorder (audience + token required). |
| POST | /api/runtime/asset/sign-url | Runtime Bearer | Presign an upload URL for runtime assets (content-type allowlist, scope `files.write`). |
| POST | /api/runtime/checkpoint/save | Runtime Bearer | Save a small JSON snapshot keyed by `{ key }` (size limit). |
| GET | /api/runtime/checkpoint/load?key= | Runtime Bearer | Load a previously saved checkpoint. |
| GET | /api/runtime/outcomes?course_id&offset&limit | Teacher | List interactive attempts for a course (paged; returns `x-total-count`) |
| GET | /api/runtime/outcomes/export?course_id | Teacher | Export interactive attempts as CSV (teacher of course only) |
| GET | /api/runtime/outcomes/export?course_id | Teacher | Export interactive attempts as CSV (teacher of course only) |
| GET | /api/runtime/teacher/outcomes | Teacher | Recent attempts across teacher courses |
| GET | /api/providers | Auth | List course providers |
| POST | /api/providers | Admin | Create course provider |
| GET | /api/providers/health?id | Admin | Provider health check (JWKS+domain); cached; per-user rate-limited |
| GET | /api/providers/health/summaries | Admin | Cached provider health summaries |
| POST | /api/test/reset | Test-mode | Reset in-memory test store |
| POST | /api/__test__/reset | Test-mode | Reset in-memory test store (legacy path) |
| GET | /api/messages?thread_id | Auth | List messages in a thread (participants only) |
| POST | /api/messages | Auth | Send message to a thread |
| PATCH | /api/messages?id | Auth | Mark a message read |
| GET | /api/messages/threads | Auth | List user's threads with unread counts |
| GET | /api/teacher/grading-queue?courseId&assignmentId&page&limit | Teacher | List ungraded submissions across teacher's courses (paged; returns `x-total-count`) |
| POST | /api/messages/threads | Auth | Create a thread with participants |
| PATCH | /api/messages/threads/[id]/read-all | Auth | Mark all messages in a thread read |
| GET | /api/admin/metrics | Admin | In-memory metrics: count, p50, p95, errors per route (Prometheus text if `Accept: text/plain`) |
| GET | /api/internal/metrics | Token | Prometheus text; send `x-metrics-token: $METRICS_TOKEN` |
| GET | /api/admin/quotas | Admin | List storage quotas |
| PATCH | /api/admin/quotas | Admin | Upsert a user's `max_bytes` |
| GET | /api/notifications/preferences | Auth | Get notification preferences |
| PATCH | /api/notifications/preferences | Auth | Update notification preferences |
| POST | /api/announcements | Teacher | Create an announcement |
| GET | /api/announcements?course_id | Auth | List announcements for a course |
| DELETE | /api/announcements?id | Teacher | Delete an announcement |
| GET | /api/reports/engagement?course_id | Auth | Lessons/Assignments/Submissions counts (JSON) or CSV with `format=csv` |
| GET | /api/reports/grade-distribution?course_id | Auth | Score distribution/average (JSON) or CSV with `format=csv` |
| GET | /api/reports/activity?from&to&course_id&limit | Auth | Recent events (JSON) |
| GET | /api/reports/retention?from&to | Auth | Daily active users (JSON) |
| GET | /api/parent/progress?student_id&course_id&format=csv | Parent/Admin | Per-course progress for a student (JSON) or CSV |

Auth:

- Real: Supabase session cookies
- Test-mode: cookie and/or header `x-test-auth=teacher|student|parent|admin` to synthesize a role for SSR/routes

Security notes:
- In production, requests containing `x-test-auth` are rejected. `TEST_MODE` must not be set.
- All non-GET routes validate `Origin/Referer` (CSRF) and are subject to rate limits. Optional double-submit token is supported when `CSRF_DOUBLE_SUBMIT=1` (send cookie `csrf_token` matching header `x-csrf-token`).

Paging:

- List endpoints support `offset` and `limit` query params. Responses include `x-total-count` with the total number of rows matching the filter. Defaults vary by endpoint (commonly limit=50). Maximum limit=200.

Common error envelope (JSON):

```json
{ "error": { "code": "BAD_REQUEST" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "DB_ERROR" | "INTERNAL", "message": string }, "requestId": string }
```

### Response DTO validation

All API responses in core domains are validated against shared DTOs prior to returning. If validation fails, the server responds with 500 and an error envelope including the `requestId`.

DTO sources (Zod schemas) live under `packages/shared/src/dto/` or `packages/shared/src/schemas/` and are re-exported from `@education/shared`:

- `assignmentDto`, `assignmentListDto`
- `submissionDto`, `submissionListDto`
- `quizDto`, `quizListDto`
- `messageDto`, `messageListDto`
- `notificationDto`, `notificationListDto`
- `dashboardDto`
- `runtimeAttemptDto`, `runtimeAttemptListDto`
 - `authExchangeResponse`, `contextResponse` (runtime)
 - `gradingQueueRowV1`, `gradingQueueListV1`
 - `moduleDto`, `moduleListDto`
 - `enrollmentDto`, `enrollmentListDto`

All responses set the `x-request-id` header. CSV and binary endpoints retain their native formats but still echo `x-request-id`.

Rate limiting:

- When a request is throttled, the server responds with HTTP 429 and headers:
  - `retry-after`: seconds until the bucket resets
  - `x-rate-limit-remaining`: remaining tokens for the current window
  - `x-rate-limit-reset`: unix epoch seconds when the bucket resets
  - `x-request-id`: request correlation id

#### GET /api/health

Returns server health and current test-mode role (if any).

Response 200:

```json
{ "ok": true, "ts": number, "testRole": "teacher" | "student" | "parent" | "admin" | null, "testMode": boolean, "interactive": boolean, "dbOk": boolean, "flags": { "TEST_MODE": boolean, "MVP_PROD_GUARD": boolean, "RUNTIME_API_V2": boolean } }
```

<!-- Deprecated: GET /api/user/profile was removed in favor of role and Supabase auth helpers -->

#### PATCH /api/user/role

Admin-only. Update a user's role.

Request (`UpdateRoleRequest`):

```json
{ "userId": "uuid", "role": "student" | "teacher" | "parent" | "admin" }
```

Responses: 200 on success; 401 unauthenticated; 403 forbidden.

### Courses

#### POST /api/courses

Teachers only. Create a course.

Body (`CourseCreateRequest`): `{ "title": string, "description"?: string | null }`

Responses: 201 created; 400 invalid; 401; 403.

#### GET /api/courses

Teacher's own courses. 200 array; 401.

#### PATCH /api/courses/[id]

Teachers only. Update title/description.

Query param: none (id in path). Body (`CourseUpdateRequest`).

Responses: 200; 400; 401; 403; 404.

#### DELETE /api/courses/[id]
#### PATCH /api/courses/[id]/transfer-owner

Teachers can transfer ownership of their own course; admins can transfer any. Body:

```json
{ "teacher_id": "uuid" }
```

Responses: 200 with updated row; 400 invalid; 401 unauthenticated; 403 forbidden.


Teachers only. 200 `{ ok: true }`; 401; 403.

### Lessons

#### POST /api/lessons

Teachers only. Body (`LessonCreateRequest`). 201 on success.

#### GET /api/lessons?course_id={uuid}

List lessons for a course. 200 array; 400 missing course_id; 401.

#### POST /api/lessons/reorder
#### POST /api/lessons/complete

Students only. Body (`MarkLessonCompleteRequest`). 200 on success.


Teachers only. Body (`LessonReorderRequest`). 200 `{ ok: true }`; 400; 401; 403.

### Enrollments

#### POST /api/enrollments

Students only. Body (`EnrollmentCreateRequest`). 201 on success.

#### GET /api/enrollments

Authenticated. Returns current student's enrollments. 200 array; 401.

### Modules

#### POST /api/modules

Teachers only. Body (`ModuleCreateRequest`). 201 on success.

#### GET /api/modules?course_id={uuid}

Teachers only. 200 array; 400 missing course_id; 401; 403.

#### PATCH /api/modules?id={uuid}

Teachers only. Body (`ModuleUpdateRequest`). 200 updated row; 400; 401; 403.

#### DELETE /api/modules?id={uuid}

Teachers only. 200 `{ ok: true }`; 400; 401; 403.

### Assignments

#### POST /api/assignments

Teachers only. Body (`AssignmentCreateRequest`). 201 on success.

#### GET /api/assignments?course_id={uuid}

Authenticated. 200 list for course; 400; 401.

#### PATCH /api/assignments?id={uuid}

Teachers only. Body (`AssignmentUpdateRequest`). 200 updated row; 400; 401; 403.

#### DELETE /api/assignments?id={uuid}

Teachers only. 200 `{ ok: true }`; 400; 401; 403.

### Submissions
### Files

#### POST /api/files/upload-url

Request:

```json
{ "owner_type": "user|lesson|announcement|submission", "owner_id": "string", "content_type": "mime/type", "filename": "optional", "expected_bytes": 12345 }
```

Response 200: `{ url, fields? }` (test-mode returns a same-origin PUT URL)

#### PUT /api/files/upload-url?owner_type&owner_id&content_type

Test-mode only direct upload. Body is the file bytes. Returns `{ id, url }` suitable for download via `/api/files/download-url?id=...`.

#### GET /api/files/download-url?id
#### POST /api/files/finalize

Persist actual `size_bytes` and adjust quota usage.

Body:

```json
{ "key": "object_key", "size_bytes": 12345 }
```

Returns a presigned download URL (prod) or file bytes (test-mode). Owner authorization enforced.
### Announcements

#### POST /api/announcements

Teachers only. Body (`AnnouncementCreateRequest`). 201 on success.

Body example:

```json
{ "course_id": "uuid", "title": "text", "body": "text", "publish_at": null, "file_key": "optional" }
```

#### GET /api/announcements?course_id={uuid}

List announcements for a course. Authenticated students/parents/teachers of the course see published items (scheduled items are hidden until `publish_at`). Teachers may pass `include_unpublished=1` to see scheduled items.

Responses: 200 array; 400 missing/invalid query; 401 unauthenticated.

#### DELETE /api/announcements?id={uuid}

Teachers only. 200 `{ ok: true }`; 400; 401; 403.


#### POST /api/submissions

Students only. Body (`SubmissionCreateRequest`). 201 created.

#### GET /api/submissions?assignment_id={uuid}

Authenticated. 200 list; 400; 401.

#### PATCH /api/submissions?id={uuid}

Teachers only. Body (`SubmissionGradeRequest`). 200 graded row; 400; 401; 403.

### Parent Links

Admin-only writes, parent can read their own.

#### POST /api/parent-links

Body (`ParentLinkCreateRequest`). 201 created; 401; 403.

#### DELETE /api/parent-links

Body (`ParentLinkDeleteRequest`). 200 `{ ok: true }`; 401; 403.

#### GET /api/parent-links?parent_id={uuid}

Admin or the parent themself. 200 array; 400; 401; 403.

### Quizzes

#### POST /api/quizzes

Teachers only. Body (`QuizCreateRequest`). 201 created.

#### GET /api/quizzes?course_id={uuid}

Authenticated. 200 array for course; 400; 401. In test-mode, enrolled checks are relaxed for convenience.

#### PATCH /api/quizzes?id={uuid}

Teachers only. Body (`QuizUpdateRequest`). 200; 400; 401; 403.

#### DELETE /api/quizzes?id={uuid}

Teachers only. 200 `{ ok: true }`; 400; 401; 403.

### Quiz Questions

#### POST /api/quiz-questions

Teachers only. Body (`QuizQuestionCreateRequest`). 201 created.

#### GET /api/quiz-questions?quiz_id={uuid}

Authenticated. 200 array; 400; 401.

### Quiz Choices

#### POST /api/quiz-choices

Teachers only. Body (`QuizChoiceCreateRequest`). 201 created.

#### GET /api/quiz-choices?question_id={uuid}

Authenticated. 200 array; 400; 401.

### Quiz Attempts

#### POST /api/quiz-attempts

Students only. Start attempt. Body (`QuizAttemptStartRequest`). 201 created.

#### PATCH /api/quiz-attempts

Students only. Upsert answer. Body (`QuizAnswerUpsertRequest`). 200.

#### POST /api/quiz-attempts/submit

Students only. Submit attempt. Body (`QuizAttemptSubmitRequest`). 200 with graded attempt.

#### GET /api/quiz-attempts?quiz_id={uuid}

Teachers only. List attempts for a quiz. 200 array; 400; 401; 403.

### Test Utilities (test-mode only)

#### POST /api/test/reset and POST /api/__test__/reset

Reset in-memory test store. Only available when `TEST_MODE=1`.

### Contracts (Zod)

Defined in `packages/shared/src/schemas` and re-exported via `@education/shared`:

- course: `courseCreateRequest`, `courseUpdateRequest`
- lesson: `lessonCreateRequest`, `lessonReorderRequest`
- enrollment: `enrollmentCreateRequest`
- module: `moduleCreateRequest`, `moduleUpdateRequest`
- assignment: `assignmentCreateRequest`, `assignmentUpdateRequest`
- submission: `submissionCreateRequest`, `submissionGradeRequest`
- quiz: `quizCreateRequest`, `quizUpdateRequest`
- quiz question: `quizQuestionCreateRequest`
- quiz choice: `quizChoiceCreateRequest`
- quiz attempt: `quizAttemptStartRequest`, `quizAnswerUpsertRequest`, `quizAttemptSubmitRequest`
- user: `profileResponse`, `profileUpdateRequest`, `updateRoleRequest`
- dashboard: `dashboardResponse`, `studentDashboard`, `teacherDashboard`, `adminDashboard`
- progress: `markLessonCompleteRequest`, `progressResponse`
- interactive: `launchKind`, `launchTokenClaims`, `runtimeEvent`, `outcomeRequest`, runtime v2 contracts (`AuthExchange`, `ContextResponse`, `ProgressUpsert`, `GradeSubmit`, `EventEmit`, `Checkpoint*`, `AssetSignUrl`)

### Environment

- `INTERACTIVE_RUNTIME=1` — enable interactive runtime endpoints
- `RUNTIME_API_V2=1` — enable runtime v2 endpoints (auth/context/progress/grade/events/checkpoint/asset)
- `RUNTIME_CORS_ALLOW` — comma-separated origins allowed for runtime v2 CORS responses
- `NEXT_PUBLIC_CSP` — content security policy header value
- `NEXT_RUNTIME_PRIVATE_KEY` (PKCS8), `NEXT_RUNTIME_KEY_ID` — RS256 signing for launch tokens (preferred)
- `NEXT_RUNTIME_SECRET` — HS256 fallback signing secret (dev only)
- `RUNTIME_EVENTS_LIMIT`, `RUNTIME_EVENTS_WINDOW_MS` — rate limits for events
- `RUNTIME_OUTCOMES_LIMIT`, `RUNTIME_OUTCOMES_WINDOW_MS` — rate limits for outcomes
 - `SUBMISSIONS_CREATE_LIMIT`, `SUBMISSIONS_CREATE_WINDOW_MS` — per-user submission create limits
 - `GRADING_LIMIT`, `GRADING_WINDOW_MS` — per-teacher grading limits
 - `MESSAGES_LIMIT`, `MESSAGES_WINDOW_MS` — per-user messaging limits
 - `UPLOAD_RATE_LIMIT`, `UPLOAD_RATE_WINDOW_MS` — per-user file upload presign limits
 - `PROVIDER_HEALTH_LIMIT`, `PROVIDER_HEALTH_WINDOW_MS` — per-user provider health read limits
 - `MVP_PROD_GUARD=1` — disable non-MVP endpoints in production (messages/files dev stubs)
 - `TEST_MODE` — MUST be unset in production; prod rejects any `x-test-auth`
 - `GLOBAL_MUTATION_RATE_LIMIT`, `GLOBAL_MUTATION_RATE_WINDOW_MS` — optional global per-IP limit for non-GET requests
  - `INTERACTIVE_RUNTIME=1` — enables interactive events/outcomes
  - `CSRF_DOUBLE_SUBMIT=1` — enable double-submit token enforcement (cookie `csrf_token` must match header `x-csrf-token`)
  - `DUE_SOON_JOB=1` — enable scheduled due-soon notifications; `DUE_SOON_INTERVAL_MS`, `DUE_SOON_WINDOW_HOURS`
  - `CSRF_DOUBLE_SUBMIT=1` — enforce double-submit CSRF token on non-GET routes (header `x-csrf-token` must match cookie `csrf_token`)

Server env validation:

- Unified in `@education/shared` via `loadServerEnv`. The web app imports this in `apps/web/src/lib/env.ts` and fails fast on invalid/missing configuration.
- In production with `RUNTIME_API_V2=1`, RS256 keys are required: `NEXT_RUNTIME_PUBLIC_KEY`, `NEXT_RUNTIME_PRIVATE_KEY`, `NEXT_RUNTIME_KEY_ID`.

Messaging notes:

- In test-mode or when `MVP_PROD_GUARD=1`, messaging routes use in-memory stubs in `testStore` for fast e2e.
- In production (guard off), routes are DB-backed with RLS ensuring only thread participants can read/write.

### Error envelope conventions
### Pagination

- Many list endpoints accept `offset` and `limit` query params and return `x-total-count` header with the total number of matching items.
- Implemented for: messages list (`/api/messages`), notifications list, message threads list, lessons list, modules list, runtime outcomes (course and teacher), assignments list, submissions list, quizzes list, enrollments list.

### Runtime v2 security

- Tokens: RS256 preferred (public key required in prod); HS256 allowed in dev only.
- Audience binding: if the request origin is allowed by env, the runtime token `aud` must match the request origin.
- Scopes enforced:
  - `progress.write/read` for progress and checkpoints
  - `attempts.write/read` for grade and checkpoints
  - `files.write` for asset sign-url


- All route errors return a Problem-style envelope: `{ error: { code, message }, requestId }`
- Validation errors use HTTP 400 (MVP). Option to move to 422 later.
- Responses echo `x-request-id` for traceability.

### Security headers

- The app sets CSP, HSTS, Referrer-Policy, and Permissions-Policy headers. `frame-ancestors` and `connect-src` are tightened for interactive providers.

### Interactive providers (JWT)

- Launch tokens (`POST /api/enrollments/[id]/launch-token`) are RS256-signed in production; HS256 fallback is disabled in prod.
- Outcomes webhook (`POST /api/runtime/outcomes`) requires provider JWT verified via JWKS with issuer/audience checks; `nonce` one-time-use and expiry enforced.

Providers configuration:

- `jwks_url` and `domain` must use `https://` (non-HTTPS is rejected).
- On create/update, the server fetches JWKS and validates that it contains a `keys` array.

### Providers Health

- `GET /api/providers/health?id={uuid}` (admin):
  - Returns JWKS validation and domain reachability results for a provider.
  - Caches results in `provider_health` for `PROVIDER_HEALTH_TTL_MS` milliseconds.
  - Rate limited per-user using `PROVIDER_HEALTH_LIMIT` per `PROVIDER_HEALTH_WINDOW_MS`.
  - In test-mode, returns `{ ok: true, test: true }` stubs without external network calls.
- `GET /api/providers/health/summaries` (admin): returns cached results for all providers.

