## Vercel Post-deploy Smoke

Replace <domain> with your deployed domain and <metrics_token> if configured.

### Health
```bash
curl -i https://<domain>/api/ready
```

Expect: HTTP/1.1 200 OK

### EF diagnostics locked in prod
```bash
curl -i https://<domain>/api/ef/diag
```

Expect: HTTP/1.1 404 Not Found

### Courses list (auth required)
Sign in via UI first to generate a session, or use Supabase auth API to get a session cookie; then:
```bash
curl -i https://<domain>/api/courses
```

Expect: HTTP/1.1 200 OK (if signed in as teacher), else 401

### Internal metrics (if configured)
```bash
curl -i -H "x-metrics-token: <metrics_token>" https://<domain>/api/internal/metrics
```

Expect: HTTP/1.1 200 OK and Prometheus text


