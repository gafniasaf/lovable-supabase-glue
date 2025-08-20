// @ts-nocheck
import { POST as AttemptsPOST, PATCH as AttemptsPATCH, GET as AttemptsGET } from '../../apps/web/src/app/api/quiz-attempts/route';

function makePost(body: any, headers?: Record<string, string>) {
	const hdrs = { 'content-type': 'application/json', origin: 'http://localhost', referer: 'http://localhost/x', ...(headers || {}) };
	return new Request('http://localhost/api/quiz-attempts', { method: 'POST', headers: hdrs, body: JSON.stringify(body) });
}
function makePatch(body: any, headers?: Record<string, string>) {
	const hdrs = { 'content-type': 'application/json', origin: 'http://localhost', referer: 'http://localhost/x', ...(headers || {}) };
	return new Request('http://localhost/api/quiz-attempts', { method: 'PATCH', headers: hdrs, body: JSON.stringify(body) });
}
function makeGet(url: string, headers?: Record<string, string>) {
	return new Request(url, { method: 'GET', headers });
}

describe('API /api/quiz-attempts', () => {
	beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

	test('start: unauth → 401; non-student → 403; bad quiz_id → 400', async () => {
		// Clear auth
		// 
		globalThis.__TEST_HEADERS_STORE__?.cookies?.clear?.();
		let res = await (AttemptsPOST as any)(makePost({ quiz_id: '00000000-0000-0000-0000-000000000001' }));
		expect(res.status).toBe(401);
		// set teacher via cookie store
		// 
		globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
		res = await (AttemptsPOST as any)(makePost({ quiz_id: '00000000-0000-0000-0000-000000000001' }));
		expect(res.status).toBe(403);
		// student bad uuid
		// 
		globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
		res = await (AttemptsPOST as any)(makePost({ quiz_id: 'not-a-uuid' }));
		expect(res.status).toBe(400);
	});

	test('upsert: unauth → 401; non-student → 403; bad input → 400', async () => {
		// Clear auth then non-student
		// 
		globalThis.__TEST_HEADERS_STORE__?.cookies?.clear?.();
		let res = await (AttemptsPATCH as any)(makePatch({ attempt_id: '00000000-0000-0000-0000-000000000001', question_id: '00000000-0000-0000-0000-000000000002', choice_id: '00000000-0000-0000-0000-000000000003' }));
		expect(res.status).toBe(401);
		// teacher forbidden
		// 
		globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
		res = await (AttemptsPATCH as any)(makePatch({ attempt_id: '00000000-0000-0000-0000-000000000001', question_id: '00000000-0000-0000-0000-000000000002', choice_id: '00000000-0000-0000-0000-000000000003' }));
		expect(res.status).toBe(403);
		// student bad schema
		// 
		globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
		res = await (AttemptsPATCH as any)(makePatch({ attempt_id: 'not-uuid', question_id: 'bad', choice_id: 'bad' }));
		expect(res.status).toBe(400);
	});

	test('GET: missing quiz_id → 400; unauth → 401; non-teacher → 403', async () => {
		let res = await (AttemptsGET as any)(makeGet('http://localhost/api/quiz-attempts'));
		expect(res.status).toBe(400);
		res = await (AttemptsGET as any)(makeGet('http://localhost/api/quiz-attempts?quiz_id=00000000-0000-0000-0000-000000000001'));
		expect(res.status).toBe(401);
		// set student via cookie store
		// 
		globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
		res = await (AttemptsGET as any)(makeGet('http://localhost/api/quiz-attempts?quiz_id=00000000-0000-0000-0000-000000000001'));
		expect(res.status).toBe(403);
	});
});
