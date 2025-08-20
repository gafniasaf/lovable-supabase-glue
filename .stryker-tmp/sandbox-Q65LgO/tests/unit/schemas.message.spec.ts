// @ts-nocheck
import { messageThread, messageThreadCreateRequest, message, messageCreateRequest } from '@shared';

describe('message schemas', () => {
  test('thread and thread create request', () => {
    expect(() => messageThread.parse({ id: '00000000-0000-0000-0000-000000000001', created_at: new Date().toISOString() })).not.toThrow();
    expect(() => messageThreadCreateRequest.parse({ participant_ids: ['u1', 'u2'] })).not.toThrow();
    expect(() => messageThreadCreateRequest.parse({ participant_ids: [] } as any)).toThrow();
  });

  test('message and create request', () => {
    expect(() => message.parse({
      id: '00000000-0000-0000-0000-000000000001',
      thread_id: '00000000-0000-0000-0000-000000000002',
      sender_id: 'u1',
      body: 'hi',
      created_at: new Date().toISOString(),
      read_at: null
    })).not.toThrow();
    expect(() => messageCreateRequest.parse({ thread_id: '00000000-0000-0000-0000-000000000002', body: 'x' })).not.toThrow();
    // Length constraints
    expect(() => messageCreateRequest.parse({ thread_id: '00000000-0000-0000-0000-000000000002', body: '' } as any)).toThrow();
  });
});


