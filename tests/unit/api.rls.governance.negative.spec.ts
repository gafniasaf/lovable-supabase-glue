import { GET as DlqGET, PATCH as DlqPATCH } from '../../apps/web/src/app/api/admin/dlq/route';
import { GET as UsageGET } from '../../apps/web/src/app/api/admin/usage/route';
import { GET as LicensesGET, PATCH as LicensesPATCH } from '../../apps/web/src/app/api/registry/licenses/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }
function patch(url: string, body: any, headers?: Record<string,string>) { return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any); }

describe('governance/admin routes RLS/authorization negatives', () => {
	// DLQ
	test('non-admin cannot GET DLQ', async () => {
		const res = await (DlqGET as any)(get('http://localhost/api/admin/dlq', { 'x-test-auth': 'teacher' }));
		expect([401,403]).toContain(res.status);
	});

	test('non-admin cannot PATCH DLQ', async () => {
		const res = await (DlqPATCH as any)(patch('http://localhost/api/admin/dlq', { id: 'x', action: 'delete' }, { 'x-test-auth': 'student' }));
		expect([401,403]).toContain(res.status);
	});

	// Usage
	test('non-admin cannot GET usage counters', async () => {
		const res = await (UsageGET as any)(get('http://localhost/api/admin/usage', { 'x-test-auth': 'parent' }));
		expect([401,403]).toContain(res.status);
	});

	// Licenses
	test('non-admin cannot GET licenses', async () => {
		const res = await (LicensesGET as any)(get('http://localhost/api/registry/licenses', { 'x-test-auth': 'teacher' }));
		expect([401,403]).toContain(res.status);
	});

	test('non-admin cannot PATCH licenses', async () => {
		const res = await (LicensesPATCH as any)(patch('http://localhost/api/registry/licenses', { id: 'x', action: 'disable' }, { 'x-test-auth': 'student' }));
		expect([401,403]).toContain(res.status);
	});
});
