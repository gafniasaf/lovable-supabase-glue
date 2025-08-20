import { getRequestOrigin, isOriginAllowedByEnv } from './cors';

export type VerifyResult = { ok: true; claims: any } | { ok: false; status: number; message: string };

/** Verify runtime bearer token (RS256 in prod, HS256 in dev), enforce audience and optional scopes. */
export function verifyRuntimeAuthorization(req: Request, requiredScopes?: string[]): VerifyResult {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return { ok: false, status: 401, message: 'Missing runtime token' };
  let claims: any = null;
  try {
    const pub = process.env.NEXT_RUNTIME_PUBLIC_KEY || '';
    if (pub) {
      // RS256 via dynamic ESM import to satisfy Next.js bundling
      return (import('jose')
        .then(({ importSPKI, jwtVerify }) => importSPKI(pub, 'RS256')
          .then((k: any) => {
            const clockTolerance = Number(process.env.RUNTIME_CLOCK_SKEW_S || 60);
            return jwtVerify(token, k, { algorithms: ['RS256'], clockTolerance });
          })
        )
        .then((res: any) => { claims = res.payload; return proceed(); })
        .catch(() => ({ ok: false, status: 403, message: 'Invalid runtime token' } as const))
      ) as any;
    } else {
      if (process.env.NODE_ENV === 'production') return { ok: false, status: 500, message: 'NEXT_RUNTIME_PUBLIC_KEY required' };
      const secret = new TextEncoder().encode(process.env.NEXT_RUNTIME_SECRET || 'dev-secret');
      // HS256 via dynamic ESM import; always return a Promise in this path
      return (import('jose')
        .then(({ jwtVerify }) => {
          const clockTolerance = Number(process.env.RUNTIME_CLOCK_SKEW_S || 60);
          return jwtVerify(token, secret, { algorithms: ['HS256'], clockTolerance });
        })
        .then((res: any) => { claims = res.payload; return proceed(); })
        .catch(() => ({ ok: false, status: 403, message: 'Invalid runtime token' } as const))
      ) as any;
    }
  } catch {
    return (import('jose')
      .then(({ jwtVerify }) => {
        const clockTolerance = Number(process.env.RUNTIME_CLOCK_SKEW_S || 60);
        return jwtVerify(token, new TextEncoder().encode(process.env.NEXT_RUNTIME_SECRET || 'dev-secret'), { algorithms: ['HS256'], clockTolerance });
      })
      .then(({ payload }: any) => { claims = payload; return proceed(); })
      .catch(() => ({ ok: false, status: 403, message: 'Invalid runtime token' } as const))
    ) as any;
  }
  // In practice, all branches above either returned a value or a Promise.
  // Keep this for type completeness.
  return proceed();

  function proceed(): VerifyResult {
    // Audience binding when origin is allowed
    try {
      const origin = getRequestOrigin(req);
      if (origin && isOriginAllowedByEnv(origin)) {
        const aud = (claims as any)?.aud as string | undefined;
        if (!aud || aud !== origin) return { ok: false, status: 403, message: 'Audience mismatch' };
      }
    } catch {}
    if (requiredScopes && requiredScopes.length > 0) {
      const scopes: string[] = Array.isArray((claims as any)?.scopes) ? (claims as any).scopes : [];
      for (const s of requiredScopes) {
        if (!scopes.includes(s)) return { ok: false, status: 403, message: `Missing scope ${s}` };
      }
    }
    return { ok: true, claims };
  }
}


