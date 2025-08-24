describe('MessagingPort contract (definition only)', () => {
  test('module exports MessagingPort and factory', async () => {
    const mod = await import('../../apps/web/src/server/ports/messaging');
    expect(typeof mod.createInProcessMessagingAdapter).toBe('function');
    const port = mod.createInProcessMessagingAdapter();
    expect(port).toBeTruthy();
    expect(typeof port.listMessages).toBe('function');
    expect(typeof port.sendMessage).toBe('function');
    expect(typeof port.markThreadReadAll).toBe('function');
  });
});


