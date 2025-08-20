import type { JWTPayload, JWSHeaderParameters, FlattenedJWSInput } from "jose";

type RemoteJwks = (protectedHeader?: JWSHeaderParameters, token?: FlattenedJWSInput) => Promise<CryptoKey> & { alg?: string };

type CacheEntry = { jwks: RemoteJwks; expiresAt: number };

const cache = new Map<string, CacheEntry>();

/**
 * Return a cached RemoteJWKSet for the given URL with a simple TTL.
 * Default TTL: 5 minutes. Creates the set lazily on first request.
 */
export async function getRemoteJwks(url: string, ttlMs: number = Number(process.env.JWKS_TTL_MS || 5 * 60 * 1000)): Promise<RemoteJwks> {
  const now = Date.now();
  const existing = cache.get(url);
  if (existing && existing.expiresAt > now) {
    return existing.jwks;
  }
  const jose = await import("jose");
  // Enable cooldown burst refresh on verify failure by allowing manual clear via env flag (tests)
  const jwks = jose.createRemoteJWKSet(new URL(url)) as unknown as RemoteJwks;
  cache.set(url, { jwks, expiresAt: now + ttlMs });
  return jwks;
}

/** Convenience wrapper to verify RS256 JWTs using a cached JWKS. */
export async function verifyJwtWithJwks(token: string, jwksUrl: string): Promise<JWTPayload> {
  const jose = await import("jose");
  let JWKS = await getRemoteJwks(jwksUrl);
  try {
    const { payload } = await jose.jwtVerify(token, JWKS, { algorithms: ["RS256"] });
    return payload;
  } catch (e) {
    // On failure, refresh JWKS once in case of key rotation
    cache.delete(jwksUrl);
    JWKS = await getRemoteJwks(jwksUrl);
    const { payload } = await jose.jwtVerify(token, JWKS, { algorithms: ["RS256"] });
    return payload;
  }
}


