// Jest setup (CommonJS)

require('@testing-library/jest-dom');

// Minimal import.meta.env polyfill for code that references it
if (!global.import) {
  // @ts-ignore
  global.import = {};
}
if (!global.import.meta) {
  // @ts-ignore
  global.import.meta = { env: {} };
}
if (!global.import.meta.env) {
  // @ts-ignore
  global.import.meta.env = {};
}
if (!global.import.meta.env.NEXT_PUBLIC_SUPABASE_URL) {
  // @ts-ignore
  global.import.meta.env.NEXT_PUBLIC_SUPABASE_URL = '';
}
if (!global.import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  // @ts-ignore
  global.import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
}

// Polyfills sometimes required
const { TextDecoder, TextEncoder } = require('util');
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;


