// @ts-nocheck
import { POST as CompletePOST } from '../../apps/web/src/app/api/lessons/complete/route';

function makePost(body: any, headers?: Record<string, string>) {
  const hdrs = { 'content-type': 'application/json', origin: 'http://localhost', referer: 'http://localhost/x', ...(headers || {}) };
  return new Request('http://localhost/api/lessons/complete', { method: 'POST', headers: hdrs, body: JSON.stringify(body) });
}

describe('API /api/lessons/complete', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('unauth → 401; non-student → 403', async () => {
    const id = '00000000-0000-0000-0000-00000000ab01';
    let res = await (CompletePOST as any)(makePost({ lessonId: id }));
    expect(res.status).toBe(401);
    // teacher forbidden
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    res = await (CompletePOST as any)(makePost({ lessonId: id }));
    expect(res.status).toBe(403);
  });

  test('invalid payload → 400; success returns latest with lessonId/completedAt', async () => {
    // student
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    let res = await (CompletePOST as any)(makePost({}));
    expect(res.status).toBe(400);
    const id = '00000000-0000-0000-0000-00000000ab02';
    res = await (CompletePOST as any)(makePost({ lessonId: id }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.latest.lessonId).toBe(id);
    expect(typeof json.latest.completedAt).toBe('string');
  });
});

import { POST as LessonsCompletePOST } from "../../apps/web/src/app/api/lessons/complete/route";

function makeReq(body: any, headers?: Record<string, string>) {
  return new Request("http://localhost/api/lessons/complete", {
    method: "POST",
    headers: { "content-type": "application/json", ...(headers || {}) },
    body: JSON.stringify(body)
  });
}

describe("POST /api/lessons/complete", () => {
  beforeEach(() => {
    process.env.TEST_MODE = "1";
  });

  test("requires auth", async () => {
    const res = await (LessonsCompletePOST as any)(makeReq({ lessonId: "11111111-1111-1111-1111-111111111111" }));
    expect(res.status).toBe(401);
  });

  test("student can mark complete", async () => {
    const res = await (LessonsCompletePOST as any)(
      makeReq({ lessonId: "11111111-1111-1111-1111-111111111111" }, { "x-test-auth": "student" })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.latest.lessonId).toBe("11111111-1111-1111-1111-111111111111");
  });
});


