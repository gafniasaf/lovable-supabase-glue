Gateways: Frontend Data Access Contract (Draft)

Principles
- No direct fetch from pages/components. Use Gateways (thin clients) to call backend routes.
- Server Actions remain, but delegate to gateway methods.
- Gateways return typed results, surface `requestId`, and normalize errors: { code, message, requestId }.
- For unsafe methods, CSRF is handled by middleware + double-submit; gateways should forward `x-csrf-token` when running on server via existing cookie.

Provider
- Wrap pages/stories in a `GatewayProvider` with `mode: 'live' | 'test'`.
- In `test` mode (Storybook/RTL), provide in-memory stubs with deterministic data and delays.

Suggested Gateways (interfaces)
- Notifications: list(), markRead(id), markAllRead(), getPrefs(), savePrefs(prefs)
- Profiles: get(), save(input)
- Reports: engagement(courseId, range), gradeDistribution(courseId)
- Enrollments: listForStudent(), listForParent()
- Lessons: listByEnrollment(enrollmentId), markComplete(lessonId)
- Announcements: list(courseId, opts)
- Registry: listProviders(), listCourses(), listVersions()

Error Handling
- Parse JSON error: { error: { code, message }, requestId }. Map to GatewayError with requestId.
- UI should display message and requestId for support.

Performance
- Fetch concurrently (e.g., lessons per enrollment). Debounce auto-refresh where applicable.
- Provide skeletons and empty-state helpers.

Internationalization
- Wrap new strings with i18n helpers. Centralize message keys under lib/i18n/messages.

Acceptance
- Pages render skeleton, empty, error states.
- No page imports `serverFetch` directly (server actions may import gateways).



