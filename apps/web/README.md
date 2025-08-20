### apps/web

Next.js 14 (App Router) app.

Scripts:

```bash
npm run dev         # Next dev on port 3000
npm run dev:test    # Dev with TEST_MODE=1 on port 3020
npm run dev:e2e     # Dev with TEST_MODE=1 on port 3030 (for Playwright)
npm run build
npm run start
```

Docker Compose (local): see `docs/HOW_TO_RUN.md` for build/up/health/down and dev override flags.

Auth & DB:

- Supabase auth via `@supabase/auth-helpers-nextjs`
- Server utilities in `src/lib/supabaseServer.ts`
- Test mode helpers live in `src/lib/testMode.ts` and `src/lib/testStore.ts`
- Requests use `src/lib/serverFetch.ts` to propagate `x-request-id`

API routes (selected):

- `src/app/api/health/route.ts`
- `src/app/api/user/role/route.ts`
- `src/app/api/courses/route.ts`
- `src/app/api/lessons/route.ts`
- `src/app/api/modules/route.ts`
- `src/app/api/assignments/route.ts`
- `src/app/api/submissions/route.ts`
- `src/app/api/quizzes/*`

Server utilities:

- `src/server/apiHandler.ts` — Zod validation + error handling + request id
- `src/server/withRouteTiming.ts` — request id + timing logs

Pages:

- `src/app/dashboard/*` (teacher dashboard & course/lesson flows)


