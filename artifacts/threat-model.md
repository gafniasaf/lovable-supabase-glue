Threat Model (Draft)

Areas
- CSRF: Origin/Referer checks; double-submit tokens; runtime endpoints skip origin-only but rely on bearer+aud binding.
- JWT/JWKS: RS256 verification for runtime/outcomes; audience binding to Origin; scopes enforced per endpoint.
- Rate Limits: Per-IP global and per-user/alias per-route; standard 429 headers; Redis optional.
- Files/Media: MIME allow-list; ownership checks; dev namespace guard; quotas; presign via server role only.
- Data Access: RLS enforced in DB; ownership checks in handlers where necessary.
- Logging/PII: Redaction of auth headers, cookies, x-test-auth, body.email/message.body/attachments.object_key.

Abuse Cases
- Brute force runtime writes: mitigated via per-alias limits and idempotency keys.
- Cross-origin provider abuse: aud binding + CORS allowlist; invalid aud → 403.
- CSRF on app routes: origin+referer + double-submit; runtime paths exempt to allow cross-origin provider calls.
- Upload of malicious files: MIME allow-list; size/quotas; signed URLs expire.

Residual Risks
- In-memory fallbacks for rate-limit/idempotency do not survive restarts; Redis recommended.
- TEST_MODE headers must be disabled in prod (middleware guard in place).

Recommendations
- Enable Redis in stage/prod.
- Keep CSP strict; extend frame-src/connect-src only as needed.
- Monitor 4xx/5xx and 429 rates.



