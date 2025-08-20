import { POST as EnrollPOST, GET as EnrollGET } from '../../apps/web/src/app/api/enrollments/route';

function makePost(body: any, headers?: Record<string, string>) {
	return new Request('http://localhost/api/enrollments', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}
function makeGet(headers?: Record<string, string>) {
	return new Request('http://localhost/api/enrollments', { method: 'GET', headers });
}

describe('API /api/enrollments', () => {
	beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

	test('POST unauth → 401; non-student → 403; student → 201 with own student_id', async () => {
		// Clear any simulated auth
		// @ts-ignore
		globalThis.__TEST_HEADERS_STORE__?.cookies?.clear?.();
		let res = await (EnrollPOST as any)(makePost({ course_id: '00000000-0000-0000-0000-000000000001' }));
		expect(res.status).toBe(401);
		// use cookie store to simulate auth
		// @ts-ignore
		globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
		res = await (EnrollPOST as any)(makePost({ course_id: '00000000-0000-0000-0000-000000000001' }));
		expect(res.status).toBe(403);
		// switch to student
		// @ts-ignore
		globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
		res = await (EnrollPOST as any)(makePost({ course_id: '00000000-0000-0000-0000-000000000001' }));
		expect(res.status).toBe(201);
		const json = await res.json();
		expect(json.student_id).toBe('test-student-id');
	});

	test('GET unauth → 401; echoes x-request-id', async () => {
		// Clear auth
		// @ts-ignore
		globalThis.__TEST_HEADERS_STORE__?.cookies?.clear?.();
		const res = await (EnrollGET as any)(makeGet({ 'x-request-id': 'rq-enr' }));
		expect(res.status).toBe(401);
		expect(res.headers.get('x-request-id')).toBe('rq-enr');
	});
});
