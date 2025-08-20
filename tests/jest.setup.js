
(function(){
	// Safe in-scope store reference for jest.mock factory
	const __cookies = new Map();
	const __headers = new Map();
	Object.assign(globalThis, { __TEST_HEADERS_STORE__: { cookies: __cookies, headers: __headers } });
	jest.mock('next/headers', () => ({
		headers: () => ({ get: (k) => (__headers.get(k) || null) }),
		cookies: () => ({ get: (k) => { const v = __cookies.get(k); return v ? { name: k, value: v } : undefined; } })
	}), { virtual: true });
	const { TextEncoder, TextDecoder } = require('util');
	if (!global.TextEncoder) global.TextEncoder = TextEncoder;
	if (!global.TextDecoder) global.TextDecoder = TextDecoder;
	if (typeof beforeEach === 'function') {
		beforeEach(() => { try { __cookies.clear(); __headers.clear(); } catch {};
			// Default test-mode on for unit tests; individual specs can override
			try { if (!process.env.TEST_MODE) process.env.TEST_MODE = '1'; } catch {}
			try { if (!process.env.NEXT_PUBLIC_TEST_MODE) process.env.NEXT_PUBLIC_TEST_MODE = '1'; } catch {}
		});
	}
	try {
		const jobs = require('../apps/web/src/lib/jobs');
		if (jobs && typeof jobs.stopAllJobs === 'function') {
			afterEach(() => { try { jobs.stopAllJobs(); } catch {} });
		}
	} catch {}


})();
