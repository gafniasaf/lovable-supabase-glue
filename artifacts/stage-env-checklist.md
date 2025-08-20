Stage Environment Checklist (Runtime v2)

Required
- NEXT_PUBLIC_BASE_URL=https://<LMS_STAGE_DOMAIN>
- NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-project>.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
- RUNTIME_API_V2=1
- INTERACTIVE_RUNTIME=1
- NEXT_RUNTIME_PUBLIC_KEY=<PEM RS256 public key>
- NEXT_RUNTIME_PRIVATE_KEY=<PEM RS256 private key>
- NEXT_RUNTIME_KEY_ID=<kid>
- RUNTIME_CORS_ALLOW=https://wcgyhwvugdnzhegwiiam.lovable.app

Recommended
- RUNTIME_FRAME_SRC_ALLOW=https://wcgyhwvugdnzhegwiiam.lovable.app (if not supplying full NEXT_PUBLIC_CSP)
- NEXT_PUBLIC_CSP=<full CSP> (must include connect-src and frame-src with the Lovable origin if set)
- REDIS_URL=redis://... (enables cross-replica rate limits/idempotency)

Validations
1) Health: GET $BASE/api/health → 200
2) Security headers: X-Frame-Options=DENY, Referrer-Policy=strict-origin-when-cross-origin, CSP present
3) CORS preflight: OPTIONS $BASE/api/runtime/progress with Origin=$ORIGIN → 204 and allow-origin
4) Exchange: POST $BASE/api/runtime/auth/exchange (Origin=$ORIGIN) → 200 with runtimeToken
5) Runtime writes: POST progress/grade with Authorization: Bearer <runtimeToken> → 201; repeated Idempotency-Key → 200 with idempotency-replayed: 1
6) Outcomes: POST $BASE/api/runtime/outcomes with provider-signed JWT (kid matches jwks) → 201; 429 includes retry-after and x-rate-limit-* headers

Notes
- Do not use x-test-auth on stage; real Supabase session is required for admin/teacher APIs.
- In production, HSTS is enabled automatically.


