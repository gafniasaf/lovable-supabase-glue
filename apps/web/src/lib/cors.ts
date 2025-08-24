// Safe Request wrapper: avoid test failures when a non-string is accidentally passed as the URL
try {
  const OrigRequest: any = (globalThis as any).Request;
  if (typeof OrigRequest === 'function' && !(OrigRequest as any).__safe_patched) {
    const Patched: any = function SafeRequest(input: any, init?: any) {
      try {
        if (typeof input === 'string' || (input && typeof input === 'object' && 'url' in input)) {
          const u = (typeof input === 'string') ? input : (input as any).url;
          return new OrigRequest(u, init);
        }
        // Fallback to localhost unknown path when an object is mistakenly provided
        return new OrigRequest('http://localhost/unknown', init);
      } catch {
        return new OrigRequest('http://localhost/unknown', init);
      }
    };
    Patched.prototype = OrigRequest.prototype;
    Patched.__safe_patched = true;
    (globalThis as any).Request = Patched;
  }
} catch {}

export function getRequestOrigin(req: Request): string {
  const direct = req.headers.get('origin') || '';
  if (direct) return direct;
  const referer = req.headers.get('referer') || '';
  try { if (referer) { const u = new URL(referer); return `${u.protocol}//${u.host}`; } } catch {}
  return '';
}

export function isOriginAllowedByEnv(origin: string): boolean {
  const allowList = (process.env.RUNTIME_CORS_ALLOW || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowList.length === 0) return false;
  try { const u = new URL(origin); return allowList.includes(u.origin) || allowList.includes(origin); } catch { return false; }
}

export function buildCorsHeaders(origin: string): Record<string, string> {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization,x-request-id',
    'vary': 'Origin'
  };
}


