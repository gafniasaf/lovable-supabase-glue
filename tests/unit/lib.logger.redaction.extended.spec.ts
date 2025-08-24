describe('logger redaction extended fields', () => {
  test('redact list contains email, message.body, attachments.object_key', async () => {
    const mod: any = await import('../../apps/web/src/lib/logger');
    const redact = (mod.logger as any)?.__redact || {};
    const paths: string[] = (redact?.paths || []) as any;
    expect(paths).toEqual(expect.arrayContaining(['body.email','message.body','attachments.object_key']));
  });
});


