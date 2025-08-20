## Postman collection

Import `docs/postman.collection.json` into Postman.

Set variables:
- `base_url`: e.g. `http://localhost:3022`
- `role`: `teacher|student|parent|admin` (used for x-test-auth)
- `thread_id`, `message_id`: optional placeholders for message endpoints

Notes:
- For CSRF double-submit (if enabled), browser clients use the `csrf_token` cookie. For Postman, either disable CSRF in non-prod or attach `x-csrf-token` with the cookie value.

### Examples

#### Teacher grading queue (paged)

GET `{{base_url}}/api/teacher/grading-queue?page=1&limit=20`

Headers:
- `x-test-auth: {{role}}` (set to `teacher`)

Expect:
- Status 200
- Header `x-total-count`
- Body: `gradingQueueListV1` (array of rows `{ id, assignment_id, student_id, course_id, submitted_at, score }`)


