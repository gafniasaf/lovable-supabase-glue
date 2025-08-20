/* Integration test for external course ↔ LMS (TEST_MODE server on :3020) */
const BASE = process.env.LMS_BASE || 'http://localhost:3020';
const HS256_SECRET = process.env.NEXT_RUNTIME_SECRET || 'dev-secret';

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signHmac256(data, secret) {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', secret).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function makeUuid() {
  const crypto = require('crypto');
  const b = crypto.randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

function makeLaunchToken({ sub, courseId, role, scopes, callbackUrl }) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { sub, courseId, role, iat: now, exp: now + 600, nonce: makeUuid(), scopes, callbackUrl };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = signHmac256(`${encodedHeader}.${encodedPayload}`, HS256_SECRET);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function http(method, path, body, headers = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  }).catch((e) => ({ ok: false, status: 0, json: async () => ({ error: String(e?.message || e) }) }));
  let json;
  try { json = await res.json(); } catch { json = null; }
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${path}`);
    err.status = res.status; err.body = json;
    throw err;
  }
  return json;
}

(async () => {
  const title = `Sample External ${Date.now()}`;
  // 1) Create course as teacher
  const course = await http('POST', '/api/courses', {
    title,
    description: 'Integration Test',
    launch_kind: 'WebEmbed',
    launch_url: 'http://localhost:8088/',
    scopes: ['progress.write','attempts.write']
  }, { 'x-test-auth': 'teacher' });
  const courseId = course.id || course.course_id || course?.data?.id;
  if (!courseId) throw new Error('No courseId');

  // 2) Enroll student into the course
  const enroll = await http('POST', '/api/enrollments', { course_id: courseId }, { 'x-test-auth': 'student' });
  const enrollmentId = enroll.id;
  if (!enrollmentId) throw new Error('No enrollmentId');

  // 3) Create launch token (student) — local HS256 generation in TEST_MODE
  const launchToken = makeLaunchToken({
    sub: 'test-student-id',
    courseId,
    role: 'student',
    scopes: ['progress.write','attempts.write'],
    callbackUrl: `${BASE}/api/runtime/outcomes`
  });

  // 4) Exchange launch token for runtimeToken
  const ex = await http('POST', '/api/runtime/auth/exchange', { token: launchToken });
  const runtimeToken = ex.runtimeToken;
  if (!runtimeToken) throw new Error('No runtimeToken');

  // 5) Context
  const ctxRes = await fetch(BASE + '/api/runtime/context', { headers: { authorization: `Bearer ${runtimeToken}` } });
  if (!ctxRes.ok) throw new Error(`Context failed: ${ctxRes.status}`);
  const ctx = await ctxRes.json();

  // 6) Progress
  const progRes = await fetch(BASE + '/api/runtime/progress', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${runtimeToken}` }, body: JSON.stringify({ pct: 25, topic: 'chapter-1' }) });
  if (!progRes.ok) throw new Error(`Progress failed: ${progRes.status}`);

  // 7) Grade
  const gradeRes = await fetch(BASE + '/api/runtime/grade', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${runtimeToken}` }, body: JSON.stringify({ score: 85, max: 100, passed: true, runtimeAttemptId: 'attempt-1' }) });
  if (!gradeRes.ok) throw new Error(`Grade failed: ${gradeRes.status}`);

  console.log(JSON.stringify({ ok: true, courseId, enrollmentId, ctx }, null, 2));
})().catch((e) => { console.error(JSON.stringify({ ok: false, error: String(e?.message || e), status: e?.status, body: e?.body }, null, 2)); process.exit(1); });


