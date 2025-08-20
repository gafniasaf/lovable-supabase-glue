// @ts-nocheck
// Utilities to access CSP nonce in server contexts
let headersFn: any;
try {
  const nh: any = require('next/headers');
  headersFn = nh.headers;
} catch {}

export function getCspNonce(): string | null {
  try {
    const h = headersFn?.();
    const nonce = h?.get?.('x-csp-nonce') || null;
    return typeof nonce === 'string' ? nonce : null;
  } catch {
    return null;
  }
}

export function buildDefaultCsp(nonce: string): string {
  const allow = (process.env.RUNTIME_CORS_ALLOW || '').split(',').map(s => s.trim()).filter(Boolean);
  const connectList = ['self', ...allow].join(' ');
  return `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src ${connectList}; frame-ancestors 'none'; frame-src 'self';`;
}


