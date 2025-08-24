export function makeRequest(method: string, url: string, body?: any, headers?: Record<string,string>) {
  const init: any = { method, headers: { 'content-type': 'application/json', ...(headers||{}) } };
  if (body !== undefined) init.body = JSON.stringify(body);
  return new Request(url, init);
}

export function asRole(role: 'teacher'|'student'|'parent'|'admin') {
  return { 'x-test-auth': role } as const;
}


