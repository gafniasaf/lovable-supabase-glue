// Minimal HS256 JWT generator for launch tokens (dev/test only)
const crypto = require('crypto');

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signHmac256(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function uuid() {
  const b = crypto.randomBytes(16);
  // variant + version 4
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

const secret = process.env.NEXT_RUNTIME_SECRET || 'dev-secret';
const courseId = process.env.COURSE_ID || 'aaaaaaaa-aaaa-aaaa-aaaa-755574339901';
const sub = process.env.USER_ID || 'test-student-id';
const role = process.env.USER_ROLE || 'student';
const scopes = (process.env.SCOPES || 'progress.write,attempts.write').split(',').map(s => s.trim()).filter(Boolean);
const now = Math.floor(Date.now() / 1000);
const exp = now + 10 * 60;
const nonce = uuid();
const callbackUrl = (process.env.BASE_URL || 'http://localhost:3020') + '/api/runtime/outcomes';

const header = { alg: 'HS256', typ: 'JWT' };
const payload = { sub, courseId, role, iat: now, exp, nonce, scopes, callbackUrl };

const encodedHeader = base64url(JSON.stringify(header));
const encodedPayload = base64url(JSON.stringify(payload));
const signature = signHmac256(`${encodedHeader}.${encodedPayload}`, secret);
const token = `${encodedHeader}.${encodedPayload}.${signature}`;

process.stdout.write(token);


