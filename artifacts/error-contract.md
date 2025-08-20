Error Contract (Backend)

Shape
{
  "error": { "code": "STRING", "message": "HUMAN_READABLE" },
  "requestId": "UUID or opaque"
}

Headers
- x-request-id: echoed on all responses (2xx/4xx/5xx)
- For 429: retry-after, x-rate-limit-remaining, x-rate-limit-reset

Common Codes
- UNAUTHENTICATED, FORBIDDEN, BAD_REQUEST, DB_ERROR, INTERNAL, TOO_MANY_REQUESTS

Notes
- For CSRF failures: FORBIDDEN with message specifying check.
- For validation (Zod) errors: BAD_REQUEST with Zod message.
- For outcomes JWKS failures: FORBIDDEN with 'Invalid provider token'.



