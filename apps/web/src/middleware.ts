import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCspNonce, buildDefaultCsp } from '@/lib/csp';

export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers as any);
  try { requestHeaders.set('x-pathname', req.nextUrl.pathname); } catch {}
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  try {
    const nonce = getCspNonce() || 'dev';
    let csp = buildDefaultCsp(nonce);
    // Allow embedding frames from a specific origin via header
    const frameAllow = (req.headers as any)?.get?.('x-frame-allow');
    const allowEnv = (process.env.RUNTIME_FRAME_SRC_ALLOW || '').split(',').map(s => s.trim()).filter(Boolean);
    const allowList = [...allowEnv];
    if (frameAllow) {
      try {
        const val = String(frameAllow).trim();
        if (val) allowList.push(val);
      } catch {}
    }
    if (allowList.length > 0) {
      const ext = Array.from(new Set(allowList)).join(' ');
      csp = csp.replace(/frame-src[^;]*;/, (m) => `${m.slice(0, -1)} ${ext};`);
      if (!/frame-src\s/.test(csp)) {
        csp = `${csp} frame-src ${ext};`;
      }
    }
    res.headers.set('Content-Security-Policy', csp);
    // Additional security headers
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    res.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    if (process.env.COEP === '1') {
      res.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    }
    if (process.env.NODE_ENV === 'production') {
      res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    // CSRF double-submit cookie issuance
    if (process.env.CSRF_DOUBLE_SUBMIT === '1') {
      const existing = (req.headers as any)?.get?.('cookie') || '';
      const hasCsrf = /(?:^|;\s*)csrf_token=/.test(String(existing));
      try {
        const hasCookieApi = !!(res as any).cookies?.get?.('csrf_token');
        if (!hasCsrf && !hasCookieApi) {
          const token = crypto.randomUUID?.() || 'csrf-dev';
          // Set via cookies API if available
          try { (res as any).cookies?.set?.('csrf_token', token, { path: '/', httpOnly: false, sameSite: 'lax' }); } catch {}
          // Always mirror Set-Cookie header so tests that inspect headers can see it
          const prev = res.headers.get('set-cookie');
          const next = `csrf_token=${token}; Path=/; SameSite=Lax`;
          res.headers.set('set-cookie', prev ? `${prev}, ${next}` : next);
        }
      } catch {}
    }
  } catch {}
  return res;
}

export default middleware;

export const config = {
  matcher: ['/api/:path*']
};


