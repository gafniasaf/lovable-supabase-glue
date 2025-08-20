### Sample External Course (Standalone)

This is a minimal, cloud-hosted style course you can run locally in Docker to test integration with the LMS. It is intentionally outside the core system architecture.

#### What it does
- Renders in an iframe using your course `launch_url`.
- Reads the launch JWT (`?token=...`).
- Listens for `{ type: 'runtime.token' }` from the LMS and, if available, calls Runtime API v2 to send progress/grades.
- Falls back to `postMessage` events to the parent LMS if bearer calls are not enabled.

---

## Prerequisites
- Docker Desktop installed
- LMS running locally (e.g., http://localhost:3022)

---

## Run the sample course
```bash
docker compose -f docker-compose.yml build
docker compose -f docker-compose.yml up -d
```
The course will be served at `http://localhost:8088`.

To stop it:
```bash
docker compose -f docker-compose.yml down
```

---

## LMS configuration for testing
1) Enable interactive runtime and allow the sample origin for CORS:
   - `INTERACTIVE_RUNTIME=1`
   - Optional (for bearer Runtime API v2): `RUNTIME_API_V2=1`
   - For cross-origin calls from the sample: `RUNTIME_CORS_ALLOW=http://localhost:8088`

2) Create a course (teacher role) with:
   - `launch_kind`: `WebEmbed`
   - `launch_url`: `http://localhost:8088/`
   - `scopes`: include what you need, e.g. `progress.write`, `attempts.write`
   - leave `provider_id` empty for local testing (origin is derived from `launch_url`)

3) Enroll a student and launch the course from the LMS UI.

---

## How to use the sample UI
- On load, the course sends `course.ready` via `postMessage`.
- Buttons are provided to:
  - Send progress (10%, 50%, 100%)
  - Submit a grade (85/100)
  - Emit an error event
  - Save/Load a checkpoint (via `postMessage`)
- If Runtime API v2 is enabled and the LMS posts `runtime.token` to the iframe, the sample calls:
  - `GET /api/runtime/context`
  - `POST /api/runtime/progress`
  - `POST /api/runtime/grade`
  using `Authorization: Bearer <runtimeToken>`

Notes:
- Without `RUNTIME_CORS_ALLOW=http://localhost:8088`, cross-origin bearer calls from the sample will be blocked by the browser. In that case, the sample still works via `postMessage` fallback because the LMS relays events to the platform internally.

---

## Files
- `index.html`: UI and wiring
- `app.js`: Runtime token handling, API calls, and postMessage fallback
- `docker-compose.yml` and `Dockerfile`: Serve static files with Nginx at `http://localhost:8088`


