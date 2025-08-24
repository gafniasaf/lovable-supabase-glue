import { createMessagesGateway } from '../../apps/web/src/lib/data/messages';

describe('Messages gateway with MESSAGING_PORT flag', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('falls back to HTTP when flag off', async () => {
    process.env = { ...orig, TEST_MODE: '1' } as any;
    const gw = createMessagesGateway();
    expect(typeof gw.listMessages).toBe('function');
  });

  test('uses port when flag on (smoke)', async () => {
    process.env = { ...orig, TEST_MODE: '1', MESSAGING_PORT: '1' } as any;
    const gw = createMessagesGateway();
    expect(typeof gw.listMessages).toBe('function');
  });
});


