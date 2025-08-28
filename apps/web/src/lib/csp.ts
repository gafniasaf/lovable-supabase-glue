export function getCspNonce(): string | null { return null; }

export function buildDefaultCsp(nonce?: string): string {
  // Minimal permissive CSP suitable for placeholder build; tighten in real impl
  // nonce is currently unused in this stub but accepted for compatibility
  void nonce;
  return "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'";
}
