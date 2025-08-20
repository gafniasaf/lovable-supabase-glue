### Postman — Runtime v2 and Outcomes

Import `docs/postman.collection.json` and set environment variables:

- `base_url`: e.g., `http://localhost:3020` (dev) or your stage/prod base
- For runtime calls:
  - `launch_token`: paste from `/api/enrollments/{id}/launch-token`
  - `runtime_token`: set from the exchange response
- For outcomes (vendor→platform):
  - `provider_jwt`: RS256 JWT signed with your private key (kid must exist in JWKS)
  - `course_id`: LMS course UUID
  - `user_id`: launch JWT `sub` (student UUID)

Sequence:
1) Runtime v2 — exchange → context → progress → grade → checkpoint save/load
2) Outcomes — attempt.completed / progress

Troubleshooting:
- 403: check audience (`aud`) origin matches request origin; verify scopes.
- 429: respect `retry-after` header; reduce request rate.
- Outcomes 403: verify RS256 token against JWKS; `kid` must match.


