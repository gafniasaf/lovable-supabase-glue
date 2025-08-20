# Frontend Gateways

Gateways provide a simple, typed abstraction for data access from components and pages. Each domain has its own file in `apps/web/src/lib/data/*` with:

- A `<Domain>Gateway` TypeScript type listing available methods
- A `createHttpGateway()` (real HTTP) and `createTestGateway()` (test-mode/in-memory) implementation
- A `create<Domain>Gateway()` that uses `isTestMode()` to select the appropriate gateway

All gateways use Zod schemas from `@education/shared` to validate responses and normalize shapes to reduce UI conditionals.

## Adding a Gateway
1. Create `apps/web/src/lib/data/<domain>.ts`
2. Build `buildHttpGateway()` and (optionally) test-mode delegating to HTTP for MVP
3. Re-export from the barrel `apps/web/src/lib/data/index.ts`
4. Replace direct `fetch` usages in pages with the gateway calls

## Error Handling
Gateways should throw on error envelopes with `{ error, requestId }`. Use the helper in `apps/web/src/lib/errorEnvelope.ts` to map to a typed `ApiError`.

## Test Mode
When `TEST_MODE=1` (and `NEXT_PUBLIC_TEST_MODE=1`), the app runs entirely against in-memory test stores. Gateways call the same API, which returns test-mode responses. In Storybook, a lightweight `GatewayProvider` sets a runtime `window.__TEST_MODE__` flag so gateways consistently choose test mode without build-time env.

- Seed: `/api/test/seed?hard=1`
- Switch role: `/api/test/switch-role`

## Helpers

- `clientFetch(path, init)`: client-side fetch that mirrors server header propagation (notably `x-test-auth`) and respects `NEXT_PUBLIC_BASE_URL`.
- `paginate.ts`:
  - `toQuery({ offset, limit })` → `?offset=..&limit=..`
  - `parseTotalCount(headers)` → number | undefined from `x-total-count`
- `uploadBinaryToUrl(url, body, { method, headers })` in `apps/web/src/lib/files.ts` for presigned PUT uploads.

Gateways should prefer these helpers to reduce duplication.

## Linting guardrail

Dashboard pages (`src/app/dashboard/**`) must not import `@/lib/serverFetch`. Use gateways. An ESLint rule enforces this.

## Environment

See `.env.example` in the app for common flags (`TEST_MODE`, `NEXT_PUBLIC_TEST_MODE`, `INTERACTIVE_RUNTIME`, `RUNTIME_API_V2`, optional `NEXT_PUBLIC_BASE_URL`).

## New Gateways in this iteration

- RuntimeGateway: token exchange and event dispatch for interactive runtime embeds
- EnrollmentsGateway: student-side launch-token exchange used by interactive embeds
- GatewayProvider: client-only helper to force Test mode in Storybook/preview environments
- GradingGateway: teacher grading queue (list ungraded submissions, list assignments for course)
- TeacherProgressGateway: lesson completion counts and per-student progress
- InteractiveOutcomesGateway: recent interactive outcomes for teacher/course

### Runtime and Enrollments

- RuntimeGateway
  - `exchangeToken({ token }): { runtimeToken, expiresAt }`
  - `sendEvent({ runtimeToken, ...event }): { ok: true }`
- EnrollmentsGateway
  - `getLaunchToken(enrollmentId): { token, expiresAt }`

Gateways accept server and client calls; server calls use `serverFetch`, client calls use `fetch` with `NEXT_PUBLIC_BASE_URL` and the current cookies for `x-test-auth`.

### Batch lookups (ergonomics)

To reduce per-row DB checks in pages like the grading queue, use batch methods:

- `ProfilesGateway.getDisplayNamesByIds(ids: string[]) -> Record<id, name>`
- `CoursesGateway.getTitlesByIds(ids: string[]) -> Record<id, title>`

These are server-only lookups and are safe to call from Server Components.
