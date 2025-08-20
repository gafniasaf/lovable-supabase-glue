/*
 Contract ping script
 - Seeds test data (if available)
 - Pings health and a few authenticated endpoints
 - Verifies HTTP 2xx, presence of x-request-id, and basic JSON shape

 Run with:
   CONTRACT_BASE_URL=http://localhost:3022 node scripts/contract-ping.js
*/
// @ts-nocheck


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


