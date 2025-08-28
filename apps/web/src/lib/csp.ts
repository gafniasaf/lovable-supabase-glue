export function getCspNonce(): string | null { return null; }

export function buildDefaultCsp(): string {
  // Minimal permissive CSP suitable for placeholder build; tighten in real impl
  return "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'";
}
