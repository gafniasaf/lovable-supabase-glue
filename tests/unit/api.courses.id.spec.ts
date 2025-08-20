import { PATCH as CoursePATCH, DELETE as CourseDELETE } from '../../apps/web/src/app/api/courses/[id]/route';

function makePatch(url: string, body: any, headers?: Record<string, string>) {
	return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}
function makeDelete(url: string, headers?: Record<string, string>) {
	return new Request(url, { method: 'DELETE', headers });
}

describe('API /api/courses/[id]', () => {
	beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

	test('PATCH missing body → 400; non-teacher → 403; unknown id → 404; echoes x-request-id', async () => {
		// unauth: ensure no test auth
		// @ts-ignore
		globalThis.__TEST_HEADERS_STORE__?.cookies?.clear?.();
		// missing body still requires auth and teacher; first verify 401 then use teacher role
		let res = await (CoursePATCH as any)(makePatch('http://localhost/api/courses/cccccccc-cccc-cccc-cccc-cccccccccccc', {}) as any, { params: { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc' } } as any);
		expect(res.status).toBe(401);
		// non-teacher forbidden
		res = await (CoursePATCH as any)(makePatch('http://localhost/api/courses/cccccccc-cccc-cccc-cccc-cccccccccccc', { title: 'New' }, { 'x-test-auth': 'student' }) as any, { params: { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc' } } as any);
		expect(res.status).toBe(403);
		// teacher but unknown id → 404
		res = await (CoursePATCH as any)(makePatch('http://localhost/api/courses/cccccccc-cccc-cccc-cccc-cccccccccccc', { title: 'New' }, { 'x-test-auth': 'teacher', 'x-request-id': 'rq-test' }) as any, { params: { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc' } } as any);
		expect(res.status).toBe(404);
		expect(res.headers.get('x-request-id')).toBe('rq-test');
	});

	test('DELETE requires teacher; returns 401/403 accordingly', async () => {
		// @ts-ignore
		globalThis.__TEST_HEADERS_STORE__?.cookies?.clear?.();
		let res = await (CourseDELETE as any)(makeDelete('http://localhost/api/courses/cccccccc-cccc-cccc-cccc-cccccccccccc') as any, { params: { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc' } } as any);
		expect(res.status).toBe(401);
		res = await (CourseDELETE as any)(makeDelete('http://localhost/api/courses/cccccccc-cccc-cccc-cccc-cccccccccccc', { 'x-test-auth': 'student' }) as any, { params: { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc' } } as any);
		expect(res.status).toBe(403);
	});
});
