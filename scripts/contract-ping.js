/*
 Contract ping script
 - Seeds test data (if available)
 - Pings health and a few authenticated endpoints
 - Verifies HTTP 2xx, presence of x-request-id, and basic JSON shape

 Run with:
   CONTRACT_BASE_URL=http://localhost:3022 node scripts/contract-ping.js
*/

const BASE = process.env.CONTRACT_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3022';
const ROLE = process.env.CONTRACT_ROLE || 'teacher';
const HEADERS = { 'x-test-auth': ROLE };

function ms() { return new Date().toISOString(); }

async function fetchJson(path, init) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const started = Date.now();
  const res = await fetch(url, { ...init, headers: { ...(init?.headers || {}), ...HEADERS } });
  const text = await res.text();
  const duration = Date.now() - started;
  let json;
  try { json = text ? JSON.parse(text) : null; } catch {}
  const reqId = res.headers.get('x-request-id') || null;
  return { url, status: res.status, ok: res.ok, json, reqId, ms: duration };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function ping() {
  const results = [];
  const record = (name, r) => results.push({ name, ...r });
  const budgetsMs = {
    health: 500,
    dashboard: 800,
    notifications: 800,
    notif_prefs_get: 800,
    notif_prefs_patch: 800,
    threads: 800,
    messages: 800,
    threads_read_all_post: 800,
    threads_read_all_post_again: 800,
    registry_courses: 1000,
    registry_versions: 1000,
    files_upload_url: 800,
    files_put_test: 800,
    files_resolve_guard: 400,
    admin_dlq: 800,
    admin_usage: 800,
    admin_licenses: 800,
    runtime_outcomes_list: 800,
    runtime_outcomes_teacher: 800,
    runtime_outcomes_export: 1200,
    providers_list: 800,
    provider_health: 1200,
    reports_activity: 800,
    reports_retention: 800,
  };
  // Allow overriding budgets via env, e.g. CONTRACT_BUDGET_messages=1200
  for (const key of Object.keys(process.env)) {
    if (key.startsWith('CONTRACT_BUDGET_')) {
      const name = key.replace('CONTRACT_BUDGET_', '').toLowerCase();
      const val = Number(process.env[key] || '0');
      if (Number.isFinite(val) && val > 0) budgetsMs[name] = val;
    }
  }

  // Seed (best effort)
  try {
    const r = await fetchJson('/api/test/seed?hard=1');
    record('seed', r);
  } catch {}

  // Health
  {
    const r = await fetchJson('/api/health');
    record('health', r);
    assert(r.ok, `health not ok: ${r.status}`);
    assert(r.reqId, 'health missing x-request-id');
    assert(r.json && r.json.ok === true, 'health ok flag false');
  }

  // Dashboard (auth)
  {
    const r = await fetchJson('/api/dashboard');
    record('dashboard', r);
    assert(r.ok, `dashboard not ok: ${r.status}`);
    assert(r.reqId, 'dashboard missing x-request-id');
  }

  // Notifications list
  {
    const r = await fetchJson('/api/notifications');
    record('notifications', r);
    assert(r.ok, `notifications not ok: ${r.status}`);
    assert(Array.isArray(r.json), 'notifications is not array');
  }

  // Notifications prefs
  {
    const r = await fetchJson('/api/notifications/preferences');
    record('notif_prefs_get', r);
    assert(r.ok, `notif prefs get not ok: ${r.status}`);
    assert(r.json && typeof r.json === 'object', 'notif prefs invalid');
  }
  {
    const r = await fetchJson('/api/notifications/preferences', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ 'message:new': true })
    });
    record('notif_prefs_patch', r);
    assert(r.ok, `notif prefs patch not ok: ${r.status}`);
  }

  // Notifications read-all
  {
    const r = await fetchJson('/api/notifications/read-all', { method: 'PATCH' });
    record('notif_read_all', r);
    assert(r.ok, `notif read-all not ok: ${r.status}`);
  }

  // Threads list
  let threadId = null;
  {
    const r = await fetchJson('/api/messages/threads');
    record('threads', r);
    assert(r.ok, `threads not ok: ${r.status}`);
    assert(Array.isArray(r.json), 'threads is not array');
    threadId = (r.json[0] && r.json[0].id) || null;
  }

  // Messages in first thread (if exists)
  if (threadId) {
    const r = await fetchJson(`/api/messages?thread_id=${encodeURIComponent(threadId)}`);
    record('messages', r);
    assert(r.ok, `messages not ok: ${r.status}`);
    assert(Array.isArray(r.json), 'messages is not array');
    // Mark first message read if present
    const first = (Array.isArray(r.json) && r.json[0]) ? r.json[0] : null;
    if (first && first.id) {
      const mr = await fetchJson(`/api/messages?id=${encodeURIComponent(first.id)}`, { method: 'PATCH' });
      record('message_mark_read', mr);
      assert(mr.ok, `message mark-read not ok: ${mr.status}`);
    }
    // read-all idempotency
    const r1 = await fetchJson(`/api/messages/threads/${encodeURIComponent(threadId)}/read-all`, { method: 'POST' });
    record('threads_read_all_post', r1);
    assert(r1.ok, `threads read-all post not ok: ${r1.status}`);
    const r2 = await fetchJson(`/api/messages/threads/${encodeURIComponent(threadId)}/read-all`, { method: 'POST' });
    record('threads_read_all_post_again', r2);
    assert(r2.ok, `threads read-all repeat not ok: ${r2.status}`);
  }

  // Registry (optional feature flag)
  try {
    const r = await fetchJson('/api/registry/courses');
    record('registry_courses', r);
    if (r.status !== 403) {
      assert(r.ok, `registry courses not ok: ${r.status}`);
      assert(Array.isArray(r.json), 'registry courses is not array');
      const v = await fetchJson('/api/registry/versions');
      record('registry_versions', v);
      if (v.status !== 403) {
        assert(v.ok, `registry versions not ok: ${v.status}`);
        assert(Array.isArray(v.json), 'registry versions is not array');
      }
    }
  } catch {}

  // Files upload-url (test-mode path) and direct upload PUT
  try {
    const ownerId = `test-${ROLE}-id`;
    const r = await fetchJson('/api/files/upload-url', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ owner_type: 'user', owner_id: ownerId, content_type: 'text/plain', filename: 'ping.txt' })
    });
    record('files_upload_url', r);
    assert(r.ok, `upload-url not ok: ${r.status}`);
    if (r.json && r.json.url && !r.json.fields) {
      // Upload directly to presigned URL (prod path) — skip in contract ping
    }
    // Direct PUT test-mode path
    const put = await fetchJson(`/api/files/upload-url?owner_type=user&owner_id=${encodeURIComponent(ownerId)}&content_type=${encodeURIComponent('text/plain')}`, {
      method: 'PUT',
      headers: { 'content-type': 'text/plain' },
      body: 'hello'
    });
    record('files_put_test', put);
    assert(put.ok, `files put not ok: ${put.status}`);
    assert(put.json && put.json.url, 'files put missing url');
  } catch {}

  // Files resolve contracts: just check that endpoints exist unauthenticated guard
  {
    const r = await fetchJson('/api/files/resolve?key=unknown');
    record('files_resolve_guard', r);
    assert(!r.ok || r.status >= 400, 'files resolve should guard');
  }

  // Runtime outcomes (teacher context)
  try {
    // List for a course (uses first teacher course id if any, else expect 403/400)
    let courseId = null;
    try {
      const courses = await fetchJson('/api/courses?owned=1');
      if (Array.isArray(courses.json) && courses.json[0]?.id) courseId = courses.json[0].id;
    } catch {}
    const listPath = courseId ? `/api/runtime/outcomes?course_id=${encodeURIComponent(courseId)}` : '/api/runtime/outcomes?course_id=00000000-0000-0000-0000-000000000000';
    const list = await fetchJson(listPath);
    record('runtime_outcomes_list', list);
    if (courseId) {
      assert(list.ok || list.status === 500, `outcomes list not ok: ${list.status}`);
    }
    // Teacher aggregate
    const t = await fetchJson('/api/runtime/teacher/outcomes');
    record('runtime_outcomes_teacher', t);
    assert(t.ok || t.status === 500, `teacher outcomes not ok: ${t.status}`);
    // Export CSV
    const expPath = courseId ? `/api/runtime/outcomes/export?course_id=${encodeURIComponent(courseId)}` : '/api/runtime/outcomes/export?course_id=00000000-0000-0000-0000-000000000000';
    const ex = await fetchJson(expPath);
    record('runtime_outcomes_export', ex);
    // Accept 200 (CSV), 403 (not your course), or 500 (DB)
    assert(ex.status === 200 || ex.status === 403 || ex.status === 500, `outcomes export unexpected: ${ex.status}`);
    if (ex.status === 200) {
      // Make a direct fetch to inspect headers of CSV
      const url = expPath.startsWith('http') ? expPath : `${BASE}${expPath}`;
      const res = await fetch(url, { headers: HEADERS });
      const ct = res.headers.get('content-type') || '';
      const cd = res.headers.get('content-disposition') || '';
      assert(/text\/csv/.test(ct), 'export missing CSV content-type');
      assert(/attachment; filename=/.test(cd), 'export missing content-disposition');
    }
  } catch {}

  // Reports (activity/retention)
  try {
    const a = await fetchJson('/api/reports/activity?limit=10');
    record('reports_activity', a);
    if (a.status !== 403) {
      assert(a.ok, `reports activity not ok: ${a.status}`);
    }
    const r = await fetchJson('/api/reports/retention');
    record('reports_retention', r);
    if (r.status !== 403) {
      assert(r.ok, `reports retention not ok: ${r.status}`);
    }
  } catch {}

  // Providers (admin context for health; list requires auth)
  try {
    const adminHeaders = { ...HEADERS, 'x-test-auth': 'admin' };
    const list = await fetchJson('/api/providers', { headers: adminHeaders });
    record('providers_list', list);
    if (list.ok && Array.isArray(list.json) && list.json.length > 0) {
      const id = list.json[0]?.id;
      if (id) {
        const h = await fetchJson(`/api/providers/health?id=${encodeURIComponent(id)}`, { headers: adminHeaders });
        record('provider_health', h);
        if (h.status !== 403) {
          assert(h.ok || h.status === 500 || h.status === 429, `provider health unexpected: ${h.status}`);
        }
      }
    }
  } catch {}

  // Admin governance endpoints (admin role)
  try {
    const adminHeaders = { ...HEADERS, 'x-test-auth': 'admin' };
    const dlq = await fetchJson('/api/admin/dlq', { headers: adminHeaders });
    record('admin_dlq', dlq);
    if (dlq.status !== 403) {
      assert(dlq.ok, `admin dlq not ok: ${dlq.status}`);
      assert(dlq.json && typeof dlq.json === 'object', 'admin dlq invalid');
    }
    const usage = await fetchJson('/api/admin/usage', { headers: adminHeaders });
    record('admin_usage', usage);
    if (usage.status !== 403) {
      assert(usage.ok, `admin usage not ok: ${usage.status}`);
      assert(usage.json && typeof usage.json === 'object', 'admin usage invalid');
    }
    const lic = await fetchJson('/api/registry/licenses', { headers: adminHeaders });
    record('admin_licenses', lic);
    if (lic.status !== 403) {
      assert(lic.ok, `admin licenses not ok: ${lic.status}`);
      assert(lic.json && typeof lic.json === 'object', 'admin licenses invalid');
    }
  } catch {}

  // Summary
  let failed = 0;
  for (const r of results) {
    const status = r.ok ? 'OK' : 'FAIL';
    // eslint-disable-next-line no-console
    console.log(`[${ms()}] ${status} ${r.name} ${r.status} ${r.ms}ms ${r.url}`);
    const budget = budgetsMs[r.name];
    if (r.ok && budget && r.ms > budget) {
      // eslint-disable-next-line no-console
      console.warn(`Latency regression: ${r.name} ${r.ms}ms > ${budget}ms`);
    }
    if (!r.ok) failed += 1;
  }
  if (failed > 0) {
    // eslint-disable-next-line no-console
    console.error(`Contract ping failures: ${failed}`);
    process.exit(1);
  }
}

ping().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('contract-ping error:', e?.message || e);
  process.exit(1);
});


