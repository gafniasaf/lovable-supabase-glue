// Provide a minimal import.meta.env for tests that reference it
// @ts-ignore
globalThis.import = globalThis.import || {};
// @ts-ignore
globalThis.import.meta = globalThis.import.meta || { env: {} };
// @ts-ignore
globalThis.import.meta.env = globalThis.import.meta.env || {};
// Safe defaults
// @ts-ignore
globalThis.import.meta.env.NEXT_PUBLIC_SUPABASE_URL = globalThis.import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
// @ts-ignore
globalThis.import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = globalThis.import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
require('@testing-library/jest-dom');
const { TextDecoder, TextEncoder } = require('util');

// Polyfills sometimes required by Next/RTK Query
// @ts-ignore
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder as any;



