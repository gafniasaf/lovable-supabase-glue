// @ts-nocheck
export function getRequestOrigin(req: Request): string {
  return req.headers.get('origin') || '';
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


