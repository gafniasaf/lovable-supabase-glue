import { POST as QCPost, GET as QCGet } from '../../apps/web/src/app/api/quiz-choices/route';

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/quiz-choices', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('quiz-choices DTO + headers', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('POST returns x-request-id or guard status', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (QCPost as any)(post({ question_id: '00000000-0000-0000-0000-000000000001', text: 'A', correct: true, order_index: 1 }));
    expect([201,401,403,400]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });

  test('GET returns x-request-id and JSON or guards', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (QCGet as any)(get('http://localhost/api/quiz-choices?question_id=00000000-0000-0000-0000-000000000001'));
    expect([200,401,400]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});


