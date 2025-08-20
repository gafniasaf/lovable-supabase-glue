// @ts-nocheck
(function(){
	const store = (globalThis.__TEST_HEADERS_STORE__ = globalThis.__TEST_HEADERS_STORE__ || { cookies: new Map(), headers: new Map() });
	// virtual mock for next/headers in route handler tests
	jest.mock('next/headers', () => ({
		headers: () => ({ get: (k) => store.headers.get(k) || null }),
		cookies: () => ({ get: (k) => { const v = store.cookies.get(k); return v ? { name: k, value: v } : undefined; } })
	}), { virtual: true });
	// polyfills
	const { TextEncoder, TextDecoder } = require('util');
	if (!global.TextEncoder) global.TextEncoder = TextEncoder;
	if (!global.TextDecoder) global.TextDecoder = TextDecoder;
	// Ensure isolated auth per test
	if (typeof beforeEach === 'function') {
		beforeEach(() => { try { store.cookies.clear(); store.headers.clear(); } catch {} });
	}
	// Ensure background intervals from jobs library don't keep the event loop alive
	try {
		const jobs = require('../apps/web/src/lib/jobs');
		if (jobs && typeof jobs.stopAllJobs === 'function') {
			afterEach(() => { try { jobs.stopAllJobs(); } catch {} });
		}
	} catch {}
})();
