### Roles and permissions

This system uses simple application roles to gate functionality in routes and UI. Some database tables also rely on role-based RLS via the `profiles` table.

#### Roles

- student: enroll in courses, submit assignments, take quizzes
- teacher: create/manage courses, lessons, modules, assignments, quizzes; view enrollments and submissions for their courses; grade submissions; view quiz attempts
- parent: view linked children via `parent_links`
- admin: special app-layer actions such as updating user roles and managing parent links

#### Where roles are enforced

- App layer (API routes):
  - Teachers only: `POST /api/courses`, `POST /api/lessons`, `POST /api/modules`, `PATCH/DELETE /api/courses/[id]`, `PATCH/DELETE /api/modules`, `POST/PATCH/DELETE /api/assignments`, `POST /api/quizzes`, `PATCH/DELETE /api/quizzes`, listing quiz attempts
  - Students only: `POST /api/enrollments`, `POST /api/submissions`, `POST/PATCH /api/quiz-attempts`, `POST /api/quiz-attempts/submit`
  - Admin only: `PATCH /api/user/role`, `POST/DELETE /api/parent-links`
  - Parents or admins: `GET /api/parent-links?parent_id=...`

- Database RLS (selected):
  - Course, lesson, module rows restricted to teacher owner; students can read lessons and courses they are enrolled in
  - Assignments and submissions: planned strict RLS — students can insert/select their own submissions; teachers manage assignments and can grade/select submissions for their courses
  - Parent links: parents can read their own; writes controlled in app

#### Test-mode roles

When `TEST_MODE=1` (or running Playwright), routes and SSR can synthesize a user with a role from the header or cookie `x-test-auth` (`teacher|student|parent|admin`). This enables fully automated tests without external auth. See `docs/testing.md`.


