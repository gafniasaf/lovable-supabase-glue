Rate Limit Contract (API)

Standard headers on 429
- retry-after: Integer seconds until next allowed request (ceil((resetAt-now)/1000))
- x-rate-limit-remaining: Remaining tokens in the current window (string)
- x-rate-limit-reset: Unix epoch seconds when window resets (string)
- x-request-id: Always echoed for tracing

Behavior
- All guarded routes return a structured JSON body: { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId }
- 2xx/4xx non-limit responses still echo x-request-id.
- Per-IP global mutation limit is enforced in wrappers (`withRouteTiming`, `createApiHandler`) when configured.

Representative keys (prefixes)
- Runtime V2
  - Progress: rt:prog:{courseId}:{alias}
  - Grade: rt:grade:{courseId}:{alias}
  - Events: evt:{courseId}:{alias}
  - Asset sign-url: rt:asset:{courseId}:{alias}
  - Outcomes webhook: webhook:{courseId}
- Files/Media
  - Upload URL: upload:{userId}
  - Module delete: module:del:{userId}
  - Quiz update/delete: quiz:update|quiz:del:{userId}
- Messaging
  - Send: msg:{userId}
  - Read receipts: msg:{userId}
  - Threads create: threads:{userId}
  - Threads list: threads:list:{userId}
  - Messages list: messages:list:{userId}
- Notifications
  - List: notifications:list:{userId}
  - Preferences: notiffprefs:{userId}
- Providers/Registry/Admin
  - Providers health: prov:health:{userId}
  - Provider mutates: provider:create|update|delete:{userId}
  - Registry list: registry:list:{userId}
  - Registry mutate: registry:mut:{userId}
  - Admin quotas: admin:quota:{userId}
- Courses
  - Transfer owner: course:xfer:{courseId}

Tuning
- Limits and windows are environment-driven where noted (e.g., MESSAGES_LIST_LIMIT, RUNTIME_*_LIMIT, *_WINDOW_MS).
- Global mutation limiter uses GLOBAL_MUTATION_RATE_LIMIT and GLOBAL_MUTATION_RATE_WINDOW_MS.

Notes
- All limits are best-effort; Redis-backed async limiter is used when available, else in-memory fallback.



