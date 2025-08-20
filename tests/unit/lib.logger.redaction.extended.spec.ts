describe('logger redaction extended fields', () => {
  let pinoCalls: any[] = [];
  const original = { ...process.env };
  beforeEach(() => {
    jest.resetModules();
    pinoCalls = [];
    jest.doMock('pino', () => {
      const mock = (...args: any[]) => { pinoCalls.push(args[0] || {}); return { child: () => ({ info: () => {}, error: () => {} }) } as any; };
      return { __esModule: true, default: mock };
    });
  });
  afterEach(() => { jest.dontMock('pino'); process.env = original; });

  test('redact list contains email, message.body, attachments.object_key', async () => {
    await import('../../apps/web/src/lib/logger');
    const cfg = pinoCalls[0] || {};
    const paths: string[] = (cfg?.redact?.paths || []) as any;
    expect(paths).toEqual(expect.arrayContaining(['body.email','message.body','attachments.object_key']));
  });
});


