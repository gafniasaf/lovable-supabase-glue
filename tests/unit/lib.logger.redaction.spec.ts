describe('logger redaction config', () => {
  const originalEnv = { ...process.env };
  let pinoCalls: any[] = [];

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv } as any;
    pinoCalls = [];
    jest.doMock('pino', () => {
      const mock = (...args: any[]) => {
        pinoCalls.push(args[0] || {});
        // return a minimal logger stub
        return {
          child: () => ({ info: () => {}, error: () => {} })
        } as any;
      };
      return { __esModule: true, default: mock };
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.dontMock('pino');
  });

  test('includes PII fields in redact list', async () => {
    await import('../../apps/web/src/lib/logger');
    const cfg = pinoCalls[0] || {};
    const paths: string[] = (cfg?.redact?.paths || []) as any;
    expect(Array.isArray(paths)).toBe(true);
    const required = [
      'body.email',
      'message.body',
      'attachments.object_key'
    ];
    for (const key of required) {
      expect(paths).toContain(key);
    }
  });
});


