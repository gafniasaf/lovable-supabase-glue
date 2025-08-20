Runtime Stage Smoke Test (Templates)

Variables (replace):
- STAGE=https://<LMS_STAGE_DOMAIN>
- ORIGIN=https://wcgyhwvugdnzhegwiiam.lovable.app
- COURSE_ID=<course_uuid>
- USER_ID=<user_uuid>
- LAUNCH_TOKEN=<launch_token_from_lms>
- RUNTIME_TOKEN=<runtime_token_from_exchange>
- PROVIDER_JWT=<provider_rs256_jwt_kid_tables-course-2025>

1) Health
curl -X GET "$STAGE/api/health" -H "x-request-id: smoke-1"

2) CORS preflight (runtime)
curl -X OPTIONS "$STAGE/api/runtime/progress" -H "Origin: $ORIGIN" -i

3) Exchange (mint runtime token)
curl -X POST "$STAGE/api/runtime/auth/exchange" \
  -H "Origin: $ORIGIN" -H "content-type: application/json" \
  -d "{\"token\":\"$LAUNCH_TOKEN\"}"

4) Progress (requires progress.write)
curl -X POST "$STAGE/api/runtime/progress" \
  -H "Origin: $ORIGIN" -H "content-type: application/json" \
  -H "Authorization: Bearer $RUNTIME_TOKEN" \
  -H "Idempotency-Key: 00000000-0000-0000-0000-000000000001" \
  -d "{\"pct\":55,\"topic\":\"intro\"}"

5) Grade (requires attempts.write)
curl -X POST "$STAGE/api/runtime/grade" \
  -H "Origin: $ORIGIN" -H "content-type: application/json" \
  -H "Authorization: Bearer $RUNTIME_TOKEN" \
  -H "Idempotency-Key: 00000000-0000-0000-0000-000000000002" \
  -d "{\"runtimeAttemptId\":\"ra_123\",\"score\":9,\"max\":10,\"passed\":true}"

6) Outcomes (provider → LMS; RS256 JWT via your jwks_url)
curl -X POST "$STAGE/api/runtime/outcomes" \
  -H "content-type: application/json" \
  -H "Authorization: Bearer $PROVIDER_JWT" \
  -d "{\"courseId\":\"$COURSE_ID\",\"userId\":\"$USER_ID\",\"event\":{\"type\":\"progress\",\"pct\":42,\"topic\":\"intro\"}}"

Notes
- Admin/teacher APIs require a real Supabase session; do not use x-test-auth on stage.
- Ensure env on stage: RUNTIME_API_V2=1, INTERACTIVE_RUNTIME=1, NEXT_PUBLIC_SUPABASE_URL (https), NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_RUNTIME_PUBLIC_KEY/PRIVATE_KEY/KEY_ID, RUNTIME_CORS_ALLOW=$ORIGIN (and frame-src allow via RUNTIME_FRAME_SRC_ALLOW or CSP).
- Optional: set REDIS_URL to enable cross-replica idempotency and rate-limits.


