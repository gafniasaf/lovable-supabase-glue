### Coder C — QA/Automation Checklist

Do (owned areas)
- `tests/**` (Playwright/Jest), `.github/workflows/**` (CI updates), `docs/testing.md`

Don’t Touch
- App code in `apps/web/**`; schemas/migrations.

Setup
1) Install Playwright browsers: `npx playwright install`
2) Smoke locally: `npm run smoke-test` (TEST_MODE dev server on :3030)
3) Full run: `npm run e2e`

Tasks (execute in order)
1) Keep smoke stable and fast (under 2–3 min)
2) Expand full E2E coverage (already includes):
   - seed/roles, teacher course/lesson flow, assignments/grading, profile/notifications
   - quizzes (build/attempt/submit), announcements/modules, reports JSON/CSV
   - messaging (test-mode), files upload/download (test-mode)
   - pagination/x-total-count: lessons, modules, message threads
   - registry/providers admin flows (when enabled)
3) Accessibility
   - Add `@axe-core/playwright` checks to Dashboard, Course Admin, Assignment detail, Quiz runner, Profile.
4) Visual (optional)
   - Integrate Storybook visual diffs when A adds Storybook.
5) CI
   - Ensure PRs run smoke; main runs full E2E; nightly runs contract pings (when available) to detect schema drift.

Exit criteria
- Smoke green on every PR; full E2E green on main; artifacts (traces/videos) saved on failures; docs updated.

Negative-case matrix (implement in Jest + Playwright as appropriate)

- 400: strict query/body schemas — extra/unknown keys; malformed ids.
- 401: unauthenticated requests.
- 403: role/ownership blocks — submissions list/grade, lesson/announcement uploads, providers admin-only.
- 404: quiz attempt not found on submit; file not found.
- 429: rate limits — submissions create (`SUBMISSIONS_CREATE_LIMIT`), grading (`GRADING_LIMIT`), messaging send (`MESSAGES_LIMIT`), file presign (`UPLOAD_RATE_LIMIT`), runtime events.
- 500: DTO parsing — simulate bad rows in test-mode or via fixture to trigger invalid DTO shape; assert envelope includes `requestId`.


