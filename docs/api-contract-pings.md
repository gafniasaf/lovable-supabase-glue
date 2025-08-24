## Contract Pings

Script: `scripts/contract-ping.js`

Default base: `CONTRACT_BASE_URL` (falls back to 3022)

Covered:
- Health: `/api/health`
- Dashboard: `/api/dashboard`
- Notifications: list, preferences get/patch
- Messages: threads, messages, thread read-all idempotency (POST twice)
- Files: resolve guard sanity
- Files: upload-url (test-mode path) and direct PUT flow
- Registry: courses (optional), versions (optional)
- Runtime outcomes: course list, teacher overview, and CSV export (asserts CSV headers on 200)

CI: `.github/workflows/contract-ping.yml` (nightly) runs `npm run ci:contract`


