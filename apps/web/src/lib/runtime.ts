/** Runtime helpers */

/** True when runtime v2 is enabled and environment is healthy enough to serve runtime requests. */
export function isRuntimeV2Enabled(): boolean {
  if (process.env.RUNTIME_API_V2 !== '1') return false;
  // In production, require RS256 keys to be present
  if (process.env.NODE_ENV === 'production') {
    const hasRs256 = !!(process.env.NEXT_RUNTIME_PUBLIC_KEY && process.env.NEXT_RUNTIME_PRIVATE_KEY && process.env.NEXT_RUNTIME_KEY_ID);
    const hasHs256Secret = !!process.env.NEXT_RUNTIME_SECRET; // Allow HS256 in production for test environments
    if (!hasRs256 && !hasHs256Secret) return false;
  }
  return true;
}


