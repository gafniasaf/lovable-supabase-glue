import { logger } from '../../apps/web/src/lib/logger';

describe('logger PII redaction config', () => {
  test('redact paths include headers auth/cookie, x-test-auth, sensitive body/env fields, and user ids', () => {
    const cfg = (logger as any).__redact || {};
    const redact = cfg.paths || [];
    const expected = [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-test-auth"]',
      'headers.authorization',
      'headers.cookie',
      'headers["x-test-auth"]',
      'body.password',
      'body.token',
      'body.email',
      'message.body',
      'attachments.object_key',
      'env.NEXT_RUNTIME_PRIVATE_KEY',
      'env.NEXT_RUNTIME_PUBLIC_KEY',
      'env.NEXT_RUNTIME_SECRET',
      'env.NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'user.id',
      'payload.user_id'
    ];
    for (const key of expected) expect(redact).toContain(key);
  });
});

import { logger as realLogger } from '../../apps/web/src/lib/logger';

describe('logger redaction', () => {
  test('redacts sensitive fields', () => {
    const child = realLogger.child({
      req: { headers: { authorization: 'Bearer abc', cookie: 'a=b', 'x-test-auth': 'teacher' } },
      headers: { authorization: 'Bearer abc', cookie: 'a=b', 'x-test-auth': 'teacher' },
      body: { password: 'secret', token: 'tok', email: 'a@b.c' },
      message: { body: 'private' },
      attachments: { object_key: 's3://bucket/key' },
      env: { NEXT_RUNTIME_PRIVATE_KEY: 'p', NEXT_RUNTIME_PUBLIC_KEY: 'pub', NEXT_RUNTIME_SECRET: 's', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'k' },
      user: { id: 'user-1' },
      payload: { user_id: 'user-2' }
    });
    const msg = child.bindings();
    expect(String(msg.req?.headers?.authorization || '')).toContain('[REDACTED]');
    expect(String(msg.body?.password || '')).toContain('[REDACTED]');
    expect(String(msg.message?.body || '')).toContain('[REDACTED]');
    expect(String(msg.attachments?.object_key || '')).toContain('[REDACTED]');
    expect(String(msg.env?.NEXT_RUNTIME_PRIVATE_KEY || '')).toContain('[REDACTED]');
    expect(String(msg.user?.id || '')).toContain('[REDACTED]');
    expect(String(msg.payload?.user_id || '')).toContain('[REDACTED]');
  });
});

describe('logger redaction config', () => {
  test('includes PII fields in redact list', async () => {
    const mod: any = await import('../../apps/web/src/lib/logger');
    const paths: string[] = ((mod.logger as any).__redact?.paths || []) as any;
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


