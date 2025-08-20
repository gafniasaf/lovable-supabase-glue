## Security

- ### Headers
- CSP with per-request nonce (`middleware.ts`)
- HSTS (prod), Referrer-Policy, X-Content-Type-Options, X-Frame-Options, Permissions-Policy, COOP, CORP
- Optional COEP via `COEP=1` → `Cross-Origin-Embedder-Policy: require-corp`

### CSRF
- Origin/Referer checks for non-GET in wrappers
- Optional double-submit token via `CSRF_DOUBLE_SUBMIT=1`
  - Middleware sets a `csrf_token` cookie if missing
  - `serverFetch` auto-attaches `x-csrf-token` for unsafe methods
  - External clients must copy `csrf_token` cookie to `x-csrf-token` on POST/PATCH/PUT/DELETE

Example curl (double-submit enabled):

```bash
# First, get cookies
curl -i -c cookies.txt http://localhost:3022/api/health

# Extract csrf_token from cookies.txt, then send a POST with header and cookie
CSRF=$(grep csrf_token cookies.txt | awk '{print $7}')
curl -i -b cookies.txt -H "x-csrf-token: $CSRF" -H "content-type: application/json" \
  -d '{"thread_id":"00000000-0000-0000-0000-000000000000","body":"hi"}' \
  http://localhost:3022/api/messages
```

### Rate limiting
- Global per-IP for mutations via env
- Per-route limits on submissions, grading, messaging, files, runtime
- Counters: `rate_limit.hit`

### Auth/ownership
- Strict checks on submissions and file access; test-mode guards

### File uploads
- Allowlist MIME types via `ALLOWED_UPLOAD_MIME`
- Enforce `UPLOAD_RATE_LIMIT/_WINDOW_MS` and optional `UPLOAD_MAX_BYTES`
- Filenames are sanitized to `a-zA-Z0-9._-` and truncated to 128 chars; sanitized suffix included in object key

### JWT/JWKS
- Runtime tokens (RS256/HS256 dev)
- Provider outcomes via remote JWKS with caching (`JWKS_TTL_MS`)

### Test-mode guards
- `x-test-auth` is only permitted in local/test. In production:
  - Ensure `TEST_MODE` is not set
  - Middleware/routes must ignore/deny `x-test-auth`
  - Only Supabase session cookies define identity

### RLS notes
- Assignments: only course-owning teachers can write
- Submissions: students insert only their own and only if enrolled; students update only while ungraded; teachers grade only for their own courses

### Rate-limit response headers
- 429 responses include `retry-after` (seconds), `x-rate-limit-remaining`, and `x-rate-limit-reset` (epoch seconds).


