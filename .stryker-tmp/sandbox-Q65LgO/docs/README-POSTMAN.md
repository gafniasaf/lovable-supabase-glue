## Postman collection

Import `docs/postman.collection.json` into Postman.

Set variables:
- `base_url`: e.g. `http://localhost:3022`
- `role`: `teacher|student|parent|admin` (used for x-test-auth)
- `thread_id`, `message_id`: optional placeholders for message endpoints

Notes:
- For CSRF double-submit (if enabled), browser clients use the `csrf_token` cookie. For Postman, either disable CSRF in non-prod or attach `x-csrf-token` with the cookie value.


