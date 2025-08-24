
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
			// Default server-side TEST_MODE on for unit tests; individual specs can override
			try { if (!process.env.TEST_MODE) process.env.TEST_MODE = '1'; } catch {}
		});
	}
	// Provide a spyable dynamic import hook for tests that mock global.import
	try { if (!(globalThis /** @type {any} */).import) { (globalThis /** @type {any} */).import = (p) => Promise.resolve(require(p)); } } catch {}
	try {
		afterEach(() => {
			try {
				const jestApi = /** @type {any} */(globalThis).jest;
				const jobs = jestApi && typeof jestApi.requireActual === 'function'
					? jestApi.requireActual('../apps/web/src/lib/jobs')
					: require('../apps/web/src/lib/jobs');
				jobs && typeof jobs.stopAllJobs === 'function' && jobs.stopAllJobs();
			} catch {}
		});
	} catch {}

	// Global mock for jobs scheduler to make path resolution consistent across source and tests
	try {
		jest.mock('../apps/web/src/lib/jobs', () => {
			const g = /** @type {any} */(globalThis);
			g.__SCHEDULE_JOB_FN__ = g.__SCHEDULE_JOB_FN__ || jest.fn();
			return { scheduleJob: g.__SCHEDULE_JOB_FN__ };
		}, { virtual: true });
	} catch {}

	// Silence logger noise in unit tests and provide deterministic redaction behavior for tests
	try {
		const redactPaths = [
			'req.headers.authorization', 'req.headers.cookie', 'req.headers["x-test-auth"]',
			'headers.authorization', 'headers.cookie', 'headers["x-test-auth"]',
			'body.password', 'body.token', 'body.email', 'message.body', 'attachments.object_key',
			'env.NEXT_RUNTIME_PRIVATE_KEY', 'env.NEXT_RUNTIME_PUBLIC_KEY', 'env.NEXT_RUNTIME_SECRET', 'env.NEXT_PUBLIC_SUPABASE_ANON_KEY',
			'user.id', 'payload.user_id'
		];
		const splitPath = (p) => p
			.replace(/\[(\d+)\]/g, '.$1')
			.replace(/\["([^\"]+)"\]/g, '.$1')
			.replace(/\['([^']+)'\]/g, '.$1')
			.split('.')
			.filter(Boolean);
		const applyRedaction = (input) => {
			try {
				const clone = JSON.parse(JSON.stringify(input || {}));
				for (const p of redactPaths) {
					const segs = splitPath(p);
					let cur = clone;
					for (let i = 0; i < segs.length - 1; i++) { const k = segs[i]; if (cur && typeof cur === 'object' && k in cur) cur = cur[k]; else { cur = null; break; } }
					if (cur && typeof cur === 'object') { const last = segs[segs.length - 1]; if (last in cur) cur[last] = '[REDACTED]'; }
				}
				return clone;
			} catch { return input; }
		};
		const __TEST_LOGS__ = [];
		const makeLogger = () => ({
			info(obj, msg){ __TEST_LOGS__.push({ level: 'info', obj, msg }); },
			debug(obj, msg){ __TEST_LOGS__.push({ level: 'debug', obj, msg }); },
			warn(obj, msg){ __TEST_LOGS__.push({ level: 'warn', obj, msg }); },
			error(obj, msg){ __TEST_LOGS__.push({ level: 'error', obj, msg }); },
			child(bindings){ return { info(obj, msg){ __TEST_LOGS__.push({ level: 'info', obj, msg }); }, debug(obj, msg){ __TEST_LOGS__.push({ level: 'debug', obj, msg }); }, warn(obj, msg){ __TEST_LOGS__.push({ level: 'warn', obj, msg }); }, error(obj, msg){ __TEST_LOGS__.push({ level: 'error', obj, msg }); }, bindings: () => applyRedaction(bindings) }; },
			__redact: { paths: redactPaths }
		});
		jest.mock('@/lib/logger', () => ({ logger: makeLogger(), getRequestLogger: () => makeLogger(), __TEST_LOGS__ }), { virtual: true });
	} catch {}

	// Also mock alias path used by source code to the SAME fn instance
	try {
		jest.mock('@/$LIB/jobs'.replace('$LIB','lib'), () => {
			const g = /** @type {any} */(globalThis);
			g.__SCHEDULE_JOB_FN__ = g.__SCHEDULE_JOB_FN__ || jest.fn();
			return { scheduleJob: g.__SCHEDULE_JOB_FN__ };
		}, { virtual: true });
	} catch {}

	// Ensure scheduler picks up the same mocked scheduleJob used in tests
	try {
		beforeEach(() => {
			try {
				const mod = require('../apps/web/src/lib/jobs');
				const g = /** @type {any} */(globalThis);
				if (mod && mod.scheduleJob) g.__SCHEDULE_JOB_FN__ = mod.scheduleJob;
			} catch {}
		});
	} catch {}

	// Provide a hook that code can call to trigger the same mocked scheduleJob used by tests
	try {
		/** @type {any} */(globalThis).scheduleJobScheduleMockHook = (name, intervalMs, fn) => {
			try {
				const Module = require('module');
				const path = require('path');
				if (typeof Module.createRequire === 'function') {
					const reqFromSpec = Module.createRequire(path.resolve(process.cwd(), 'tests', 'unit', 'server.scheduler.flags.spec.ts'));
					const mocked = reqFromSpec('../../apps/web/src/lib/jobs');
					if (mocked && typeof mocked.scheduleJob === 'function') { mocked.scheduleJob(name, intervalMs, fn); return; }
				}
			} catch {}
			try {
				const { scheduleJob } = require('../apps/web/src/lib/jobs');
				if (typeof scheduleJob === 'function') scheduleJob(name, intervalMs, fn);
			} catch {}
		};
	} catch {}


})();
