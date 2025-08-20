### External Course Vendor Checklist

- Provider registration
  - Name, domain (HTTPS), jwks_url (HTTPS JWKS) shared with platform

- Course runtime
  - launch_url accepts `?token=<jwt>` and performs token exchange (or listens for `runtime.token`)
  - Standardized signals only:
    - Progress: `{ pct, topic? }`
    - Grade: `{ score, max, passed, runtimeAttemptId? }`
    - Optional events: `course.ready`, `course.progress`, `course.attempt.completed`, `course.error`
  - Checkpoints: small JSON (~32 KB), throttled
  - Optional uploads via platform `asset/sign-url` (if granted `files.write`)

- Webhooks (optional)
  - Only `attempt.completed` and `progress`; extra analytics in `event.raw` (no PII)
  - RS256 JWT signed with private key; `kid` in JWKS

- Hosting
  - SPA fallback (404→index.html)
  - Embedding allowed (no X-Frame-Options: DENY; frame-ancestors allows platform domain)
  - CSP (if set) allows platform API and frame-ancestors

- Networking
  - Cross-origin fetch with `Authorization: Bearer` supported
  - Handle CORS preflight automatically (browser)

- Performance & reliability
  - Respect 429 retry-after, back off and retry
  - Keep payloads compact; avoid chatty loops


