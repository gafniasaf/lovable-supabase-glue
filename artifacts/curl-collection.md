Minimal cURL Collection (Templates)

Set:
- export STAGE="https://<LMS_STAGE_DOMAIN>"
- export ORIGIN="https://wcgyhwvugdnzhegwiiam.lovable.app"

Health
curl -X GET "$STAGE/api/health" -H "x-request-id: smoke-1"

Runtime Exchange
curl -X POST "$STAGE/api/runtime/auth/exchange" \
  -H "Origin: $ORIGIN" -H "content-type: application/json" \
  -d '{"token":"<LAUNCH_TOKEN>"}'

Progress (Idempotent)
curl -X POST "$STAGE/api/runtime/progress" \
  -H "Origin: $ORIGIN" -H "content-type: application/json" \
  -H "Authorization: Bearer <RUNTIME_TOKEN>" \
  -H "Idempotency-Key: 00000000-0000-0000-0000-000000000001" \
  -d '{"pct":55,"topic":"intro"}'

Grade (Idempotent)
curl -X POST "$STAGE/api/runtime/grade" \
  -H "Origin: $ORIGIN" -H "content-type: application/json" \
  -H "Authorization: Bearer <RUNTIME_TOKEN>" \
  -H "Idempotency-Key: 00000000-0000-0000-0000-000000000002" \
  -d '{"runtimeAttemptId":"ra_123","score":9,"max":10,"passed":true}'

Outcomes (Provider)
curl -X POST "$STAGE/api/runtime/outcomes" \
  -H "content-type: application/json" \
  -H "Authorization: Bearer <PROVIDER_JWT_RS256>" \
  -d '{"courseId":"<COURSE_ID>","userId":"<USER_ID>","event":{"type":"progress","pct":42}}'

Asset Sign-URL
curl -X OPTIONS "$STAGE/api/runtime/asset/sign-url" -H "Origin: $ORIGIN" -i



