export function setTestRole(role: 'teacher'|'student'|'parent'|'admin') {
  const g: any = (globalThis as any);
  g.__TEST_HEADERS_STORE__ = g.__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
  g.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', role);
}

export function clearTestRole() {
  const g: any = (globalThis as any);
  if (g.__TEST_HEADERS_STORE__?.cookies?.clear) g.__TEST_HEADERS_STORE__.cookies.clear();
}


