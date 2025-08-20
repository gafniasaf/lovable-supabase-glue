## API quickstart

Base URL: set `NEXT_PUBLIC_BASE_URL` or use `http://localhost:3022` in dev.

### Health
curl "${BASE:-http://localhost:3022}/api/health" -i

### Dashboard (test role header)
curl -H "x-test-auth: teacher" "${BASE:-http://localhost:3022}/api/dashboard" -i

### Notifications
curl -H "x-test-auth: student" "${BASE:-http://localhost:3022}/api/notifications" -i
curl -H "x-test-auth: student" "${BASE:-http://localhost:3022}/api/notifications/preferences" -i
curl -H "x-test-auth: student" -H 'content-type: application/json' -d '{"message:new": true}' "${BASE:-http://localhost:3022}/api/notifications/preferences" -i -X PATCH

### Messages
curl -H "x-test-auth: student" "${BASE:-http://localhost:3022}/api/messages/threads" -i
curl -H "x-test-auth: student" "${BASE:-http://localhost:3022}/api/messages?thread_id=${THREAD}" -i

### Files
Presign:
curl -H "x-test-auth: student" -H 'content-type: application/json' -d '{"owner_type":"user","owner_id":"test-user","content_type":"text/plain","filename":"hello.txt","expected_bytes":5}' "${BASE:-http://localhost:3022}/api/files/upload-url" -i -X POST

Upload to the returned URL (omit in test-mode):
curl -H 'content-type: text/plain' --data 'hello' "<signed upload url>" -i -X PUT

Test-mode direct PUT path:
curl -H "x-test-auth: student" -H 'content-type: text/plain' --data 'hello' "${BASE:-http://localhost:3022}/api/files/upload-url?owner_type=user&owner_id=test-user&content_type=text/plain" -i -X PUT

### CSRF (double-submit enabled)
curl -c cookies.txt "${BASE:-http://localhost:3022}/api/health" -i
CSRF=$(grep csrf_token cookies.txt | awk '{print $7}')
curl -b cookies.txt -H "x-csrf-token: $CSRF" -H 'content-type: application/json' -d '{"thread_id":"00000000-0000-0000-0000-000000000000","body":"hi"}' "${BASE:-http://localhost:3022}/api/messages" -i


