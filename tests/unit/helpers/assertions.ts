export async function expectJson(res: Response) {
  const txt = await res.text();
  try { return JSON.parse(txt); } catch { throw new Error('Response not JSON: ' + txt); }
}

export function expectHeader(res: Response, name: string) {
  const v = res.headers.get(name);
  expect(v).toBeTruthy();
  return v;
}

export function expectStatus(res: Response, ...allowed: number[]) {
  expect(allowed).toContain(res.status);
}


