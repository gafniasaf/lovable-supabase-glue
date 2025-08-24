## Ops Runbook

### Boot
- Ensure envs are set (see `docs/env.md`): Supabase URL/key, optional runtime keys for v2
- Start web: `npm --workspace apps/web run start` (prod build required)

### Health
- GET `/api/health` should return `{ ok: true }`
- Fields: `dbOk`, `storageOk`, `providers` (best-effort JWKS reachability), `flags`, `requiredEnvs`, `rateLimits`

### Security
- CSRF: set `CSRF_DOUBLE_SUBMIT=1` to enforce header `x-csrf-token` matching `csrf_token` cookie
- COEP: set `COEP=1` for `Cross-Origin-Embedder-Policy: require-corp` (enable only if prepared)

### Rate limits (env defaults)
- Global mutations: `GLOBAL_MUTATION_RATE_LIMIT`, `GLOBAL_MUTATION_RATE_WINDOW_MS`
- Messages list: `MESSAGES_LIST_LIMIT`, `MESSAGES_LIST_WINDOW_MS`
- Uploads: `UPLOAD_RATE_LIMIT`, `UPLOAD_RATE_WINDOW_MS`, `ALLOWED_UPLOAD_MIME`, `UPLOAD_MAX_BYTES`
- Registry: `REGISTRY_LIST_LIMIT`, `REGISTRY_LIST_WINDOW_MS`, `REGISTRY_MUTATE_LIMIT`, `REGISTRY_MUTATE_WINDOW_MS`, `EXTERNAL_COURSES`

### Metrics
- Admin metrics: GET `/api/admin/metrics` → `{ timings, counters }`
- Counters include: `rate_limit.hit`, `csrf.fail`, `csrf.double_submit.fail`, `jwks.verify_fail`

### Governance operations
- Dead letters (DLQ):
  - Inspect: `GET /api/admin/dlq`
  - Replay or delete: `PATCH /api/admin/dlq` with `{ id, action: 'replay'|'delete' }`
- Usage counters:
  - Inspect aggregates: `GET /api/admin/usage`
  - Export CSV/JSON: `GET /api/admin/export?entity=usage&format=csv|json`
- Licenses:
  - Inspect: `GET /api/registry/licenses`
  - Enforce/disable/update: `PATCH /api/registry/licenses` with `{ id, action: 'enforce'|'disable'|'update', data? }`
  - Enable enforcement in launch flow: set `LICENSE_ENFORCEMENT=1` (denies launches when license inactive or seats exhausted)

Troubleshooting:
- 403 during launch with `LICENSE_ENFORCEMENT=1`: check license `status`, `seats_total`, `seats_used`.
- No DLQ items replaying: ensure job processors read `next_attempt_at <= now()` and that messages are valid.
- Empty usage export: confirm events are being recorded (usage increments in runtime routes) and that date filters are correct.

### Secrets rotation
- Rotate JWT runtime (RS256) keys at least quarterly; maintain overlapping validity during rollout.
- Store private keys in your secret manager; load via envs at boot; avoid writing to disk.
- JWKS hosting: ensure `NEXT_RUNTIME_PUBLIC_KEY` is published under a stable `kid`. Rotate by publishing new key with new `kid`, update app to sign with new key id, then retire old key.
- Supabase service role: rotate in Supabase dashboard; update `NEXT_PUBLIC_SUPABASE_ANON_KEY` and server-side keys accordingly.
- Scripted helpers (optional): export current keys, generate new pair, update env files, verify via `/api/health` and contract pings.

Example (local dev template):

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem
openssl rsa -pubout -in private.pem -out public.pem
echo "PUBLIC=$(base64 -w0 public.pem)"
echo "PRIVATE=$(base64 -w0 private.pem)"
```

Helper:

```bash
node scripts/rotate-keys.js
```

### Contract pings
- Run: `CONTRACT_BASE_URL=http://localhost:3022 node scripts/contract-ping.js`
- Nightly CI: see `.github/workflows/contract-ping.yml`
- Tune latency budgets by env: `CONTRACT_BUDGET_messages=1200` (ms per endpoint name)
- Set base URL for CI: configure `CONTRACT_BASE_URL` secret/env in the workflow to target staging/prod


