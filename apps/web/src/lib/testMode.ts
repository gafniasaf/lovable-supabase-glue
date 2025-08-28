export function isTestMode(): boolean {
  try {
    return process.env.NEXT_PUBLIC_TEST_MODE === '1' || process.env.TEST_MODE === '1';
  } catch {
    return false;
  }
}

export function getTestRoleFromCookie(): string | null {
  return null;
}
