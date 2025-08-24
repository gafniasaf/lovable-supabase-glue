## System Audit — Education Platform v2

Date: {{now}}

### Scope
- Documentation and architecture alignment
- Docker build/run health
- TypeScript build/typecheck status
- Unit test health (Jest)
- Security/middleware behavior
- Observed risks and prioritized actions

### Environment Summary
- Monorepo: Next.js 14 app in `apps/web`, shared lib in `packages/shared`, tests in `tests`
- Containerization: Docker Compose (`web`, `tests` profile)
- Health endpoints: `/api/health`, `/api/ready`

### Documentation Check
- Found and reviewed: `README.md`, `docs/HOW_TO_RUN.md`, `apps/web/README.md`.
- Guidance matches repo structure; Docker/ports/env flags documented and consistent.

### Docker Build/Run
- Command: `docker compose build web`
- Result: FAILED during Next.js build (type-check step)
  - Warning: missing optional dependency `ioredis` (gracefully handled by fallback)
  - Blocking TS errors (examples below)
- Consequence: `web` image not produced → `web` cannot start → `tests` service (Playwright) cannot run under Docker.

Key blocking error examples:

```12:14:apps/web/src/app/api/messages/route.ts
      const msg = addTestMessage({ thread_id: (input as any).thread_id, sender_id: user.id, body: (input as any).body });
```

TypeScript: "user is possibly null" — nullability not proven in function scope.

```70:74:apps/web/src/server/ports/messaging.ts
export type MessagingPort = {
  listMessages(...): Promise<{ rows: MessageList; total: number }>;
  sendMessage(...): Promise<Message>;
  markThreadReadAll(...): Promise<{ ok: true }>;
};
```

Duplicate identifier `MessagingPort` with conflicting shape vs earlier `MessagingPort` used by API routes (list/send/markRead). This creates downstream type errors in `src/lib/data/messages.ts`.

### TypeScript Typecheck (apps/web)
- Command: `npm --workspace apps/web run typecheck`
- Result: FAILED
- Representative issues:
  - Nullability: `user` possibly null in message thread routes.
  - Messaging port type duplication/conflict in `src/server/ports/messaging.ts`.
  - Gateway expectations (`listMessages`/`sendMessage`) don’t match server port interface used by routes (`list`/`send`/`markRead`).
  - Lab pages: gateway method names mismatched (e.g., `AnnouncementsGateway.list` not found).
  - Data layer: `basic` typed as unknown in some helpers.

Log saved: `reports/audit/typecheck-web.log`.

### Unit Tests (Jest)
- Command: `npm --workspace tests run test`
- Result: 473 suites total: 400 passed, 73 failed
- Failure themes and examples:
  - Middleware export usage: tests call `middleware(...)` directly; ensure export shape matches expectations.
  - CSP/frame-src extension tests rely on header `x-frame-allow`; behavior present, but some expectations mismatch default CSP string.
  - Logger shim: tests expect `pino()`-like API (e.g., `child().bindings()`); current shim returns console-like object without `bindings()`, causing failures.
  - Supabase storage helpers (`files.ts`) used in unit tests without storage mock → `storage.from` undefined in tests.
  - ESM dependency `jose` in tests needs transform exception; config partially allows `jose/` but one test imports `jose` directly and mocks `jwtVerify`, leading to transform error.
  - Parent/teacher labs UI tests render login link due to missing test auth cookie/header initialization in spec.

Full Jest output saved: `reports/audit/unit-tests.log`.

### Security/Middleware Observations
- Middleware sets HSTS only in production, CSP with per-request nonce, Referrer-Policy, XFO DENY, COOP/CORP, optional COEP behind flag. Tests failing mainly due to API shape expectations, not missing headers.
- Middleware rejects `x-test-auth` when `TEST_MODE` is not enabled; tests rely on `TEST_MODE=1` (set by jest.setup), consistent.

### Risks
- Build-blocking TS errors prevent container creation and any Docker-based E2E.
- Divergent types/interfaces for the messaging port lead to fragile integration between server routes and in-process adapter/gateway.
- Test shims (pino, next/headers, supabase storage) not fully aligned with production code paths → false negatives in tests.

### Prioritized Actions
1) Unblock Docker build (TS fixes)
   - In `apps/web/src/app/api/messages/route.ts` POST handler, prove non-null user or guard:
     - Reuse the `preAuth`-verified user via handler context, or assert with `if (!user) return 401;` before accessing `user.id`.
   - In `apps/web/src/app/api/messages/threads/route.ts`, avoid `(user as any)`; extract `userId` after null-check.
   - Consolidate `MessagingPort` types in `src/server/ports/messaging.ts` into a single exported type, and align `createInProcessMessagingAdapter()` with the same method names used by API routes or adjust the gateway to call the unified interface.

2) Stabilize messaging gateway/adapter
   - Pick one API surface:
     - Option A (route-style): `list(threadId, offset, limit, userId)`, `send(threadId, body, userId)`, `markRead(messageId, userId)` and update the in-process adapter and UI gateway accordingly.
     - Option B (adapter-style): `listMessages`, `sendMessage`, `markThreadReadAll` and update routes to use the port.

3) Improve test shims
   - `tests/shims/pino.ts`: add minimal support for `bindings()` and ensure `child()` returns an object with `bindings()` and log methods to satisfy tests.
   - `tests/jest.config.cjs`: ensure `transformIgnorePatterns` allows `jose/` (already partially allowed) and tests that mock `jose` use the shim layer rather than importing ESM directly.
   - Supabase storage: provide a minimal mock for `supabase.storage.from(...).createSignedUrl/createSignedUploadUrl` for unit tests targeting `files.ts`.

4) Labs UI tests
   - Ensure test auth header/cookie is set in the specific specs before rendering SSR pages (some specs rely solely on global default).

5) Re-run CI cycle
   - After applying fixes: `docker compose build web` → `docker compose up -d web` → verify `/api/health` → unit tests → (optional) `--profile tests up tests` for Playwright.

### Quick Fix Hints (non-binding)
- Messages POST nullability (illustrative only):

```12:18:apps/web/src/app/api/messages/route.ts
    const user = await getCurrentUserInRoute();
    if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
    const msg = addTestMessage({ thread_id: (input as any).thread_id, sender_id: user.id, body: (input as any).body });
```

- Messaging port: choose one interface and remove the duplicate `export type MessagingPort` to avoid conflicts in consumers like `src/lib/data/messages.ts`.

### Attachments
- `reports/audit/typecheck-web.log`
- `reports/audit/unit-tests.log`

### Conclusion
The primary blocker is TypeScript type errors causing Docker build failure. Resolve the messaging port interface divergence and tighten user nullability checks in message routes to unblock builds. Update test shims for logger and storage to reduce false negatives. After these, re-run the Docker build and full test suites.


