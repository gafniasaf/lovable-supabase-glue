### External Interactive Course Integration — Agency Guide

This guide explains how to build and host an interactive course (web app) in your own cloud that launches from our LMS and exchanges progress/grades securely, following our platform’s design.

#### Audience
Engineering teams at third‑party vendors/agencies building rich, cloud‑hosted learning experiences.

---

## 1) Architecture Overview
- **Launch**: Our LMS embeds your course in an iframe using your `launch_url` and a short‑lived launch JWT (`token`).
- **Exchange**: Your runtime exchanges the launch token for a short‑lived bearer `runtimeToken` bound to your origin.
- **Operate**: With `runtimeToken`, your runtime calls platform APIs to read context and to submit progress/grades; optionally emit events and checkpoints.
- **Outcomes (optional, server‑to‑server)**: Your backend can POST outcomes to our webhook with a JWT signed by your JWKS.

---

## 2) Registration & Course Setup
1) Provider registration (one‑time, by our admin)
   - Provide to us:
     - `name`: your organization name
     - `domain`: HTTPS origin of your course, e.g., `https://courses.vendor.com`
     - `jwks_url`: HTTPS URL serving your JWKS for webhook auth, e.g., `https://vendor.com/.well-known/jwks.json`
   - We register via `POST /api/providers` and validate both URLs.

2) Course creation (per course)
   - Fields (created by teacher/admin on our side):
     - `title`, `description`
     - `launch_kind`: `WebEmbed`
     - `launch_url`: HTTPS URL where your app loads (we will append `?token=...` on launch)
     - `scopes`: include needed permissions, e.g., `progress.write`, `attempts.write`, `files.read`, `files.write`
     - `provider_id`: references your registered provider

3) Security & policy
   - We allowframe your origin in CSP and configure CORS to allow your origin for runtime API calls.
   - Tokens are RS256 in production; dev permits HS256 fallback.

---

## 3) Launch Flow
1) Our LMS mints a short‑lived launch token for the enrolled user:
   - Endpoint we call internally: `POST /api/enrollments/{id}/launch-token`
   - JWT claims include:
     - `sub`: user UUID
     - `courseId`: course UUID
     - `role`: `student|teacher|parent|admin`
     - `iat`, `exp` (≤10 minutes)
     - `nonce`: one‑time use
     - `scopes`: granted scopes for this launch
     - `callbackUrl`: absolute URL to outcomes webhook (`/api/runtime/outcomes`)
2) We embed your app:
   - Iframe `src`: `https://your-app/launch?token=<JWT>`
   - We also postMessage `{ type: 'runtime.token', runtimeToken, expiresAt }` to your iframe after exchange (see below). You can rely on either approach: do the exchange yourself, or just listen for this message.

---

## 4) Runtime API v2 (recommended)
All requests use `Authorization: Bearer <runtimeToken>`.

Step A — Exchange
```http
POST /api/runtime/auth/exchange
Content-Type: application/json

{ "token": "<launch JWT from URL>" }
```
Response:
```json
{ "runtimeToken": "<jwt>", "expiresAt": "2025-01-01T12:00:00Z" }
```
Notes:
- `runtimeToken` audience (`aud`) is bound to your origin; calls must originate from the same origin we allow.

Step B — Context
```http
GET /api/runtime/context
Authorization: Bearer <runtimeToken>
```
Response example:
```json
{ "alias": "u_a1b2c3d4", "role": "student", "courseId": "<uuid>", "assignmentId": null, "scopes": ["progress.write","attempts.write"] }
```

Step C — Progress (requires `progress.write`)
```http
POST /api/runtime/progress
Authorization: Bearer <runtimeToken>
Content-Type: application/json

{ "pct": 42, "topic": "chapter-3" }
```

Step D — Grade/Completion (requires `attempts.write`)
```http
POST /api/runtime/grade
Authorization: Bearer <runtimeToken>
Content-Type: application/json

{ "score": 85, "max": 100, "passed": true, "runtimeAttemptId": "attempt-123" }
```

Optional — Events
- Your runtime may emit events for telemetry/compat:
```http
POST /api/runtime/events
Authorization: Bearer <runtimeToken>
Content-Type: application/json

{ "type": "course.progress", "pct": 25 }
```
Supported types: `course.ready`, `course.progress`, `course.attempt.completed`, `course.error`.

Optional — Checkpoints & Assets
- Save: `POST /api/runtime/checkpoint/save` `{ key, state }`
- Load: `GET /api/runtime/checkpoint/load?key=...`
- Uploads: `POST /api/runtime/asset/sign-url` `{ content_type, filename? }` → returns presigned PUT URL

---

## 5) Outcomes Webhook (server‑to‑server, optional)
If you prefer pushing results from your backend, call:
```http
POST /api/runtime/outcomes
Authorization: Bearer <provider-jwt>
Content-Type: application/json

{
  "courseId": "<uuid>",
  "userId": "<uuid>",
  "event": { "type": "attempt.completed", "score": 90, "max": 100, "passed": true, "runtimeAttemptId": "attempt-42" }
}
```
or
```json
{
  "courseId": "<uuid>",
  "userId": "<uuid>",
  "event": { "type": "progress", "pct": 60, "topic": "lesson-2" }
}
```
Requirements:
- Your JWT must verify against your `jwks_url` (RS256). We enforce basic rate limits and may return 429 with `retry-after`.

---

## 6) Client‑side postMessage (compatibility path)
Your app can also communicate via `postMessage` to the parent frame:
- Listen for `{ type: 'runtime.token', runtimeToken, expiresAt }` from our LMS (origin‑checked).
- Optionally post events to the parent (used for legacy/MVP):
```js
window.parent.postMessage({ type: 'course.progress', pct: 10 }, '*'); // replace '*' with our LMS origin in production
```
Runtime v2 (bearer endpoints) is the preferred path.

---

## 7) Security & Policies
- HTTPS is mandatory for `launch_url`, `domain`, and `jwks_url`.
- Tokens: RS256 in production; short‑lived (≤10m); one‑time nonce is enforced on exchange.
- Audience binding: runtime tokens are `aud`‑bound to your origin; cross‑origin use is rejected.
- Scopes: request only what you need (`progress.write`, `attempts.write`, `files.read`, `files.write`). We enforce per‑scope checks.
- Rate limits (defaults, subject to change):
  - Runtime events: ~60/min per course+alias
  - Outcomes webhook: ~60/min per course
- PII minimization: your runtime receives a pseudonymous `alias`, not raw user UUIDs.

---

## 8) Local Development
- Coordinate with us to allow your dev origin (e.g., `http://localhost:5173`) for CORS.
- In dev, tokens may be HS256 with `NEXT_RUNTIME_SECRET`; RS256 used in production.
- Expect the launch URL param `?token=...`; implement the exchange and subsequent API calls as above.

---

## 9) Minimal Runtime Bootstrap (example)
```html
<!doctype html>
<html>
  <body>
    <script>
      (async function () {
        const params = new URLSearchParams(location.search);
        const launchToken = params.get('token');

        // Option A: do the exchange yourself
        let runtimeToken = null;
        if (launchToken) {
          const res = await fetch('/api/runtime/auth/exchange', {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ token: launchToken })
          });
          if (res.ok) runtimeToken = (await res.json()).runtimeToken;
        }

        // Option B: wait for the platform to postMessage the runtime token
        window.addEventListener('message', (evt) => {
          // TODO: check evt.origin against the expected LMS origin
          if (evt?.data?.type === 'runtime.token') {
            runtimeToken = evt.data.runtimeToken;
          }
        });

        // When ready, send a progress sample
        async function sendProgress(pct) {
          if (!runtimeToken) return;
          await fetch('/api/runtime/progress', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + runtimeToken },
            body: JSON.stringify({ pct })
          });
        }
      })();
    </script>
  </body>
</html>
```

---

## 10) Vendor Checklist
- Provider registered with `name`, `domain` (HTTPS), `jwks_url` (HTTPS, valid JWKS).
- Course configured with `launch_kind=WebEmbed`, `launch_url` (HTTPS), appropriate `scopes`, and `provider_id`.
- Runtime implements token exchange, context retrieval, progress and grade endpoints.
- postMessage listener for `runtime.token` in iframe (optional helper).
- Outcomes webhook implemented (if needed) with RS256 JWT signed by your JWKS.
- Origin/CORS checks in place; handle rate limiting and common HTTP errors (401/403/429/5xx).

For any questions or to add dev origins, contact the platform team.


