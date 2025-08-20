// @ts-nocheck
import { event, eventCreateRequest } from '@shared';

describe('event schemas', () => {
  test('event schema', () => {
    expect(() => event.parse({
      id: '00000000-0000-0000-0000-000000000001',
      user_id: null,
      event_type: 'assignment:created',
      entity_type: 'assignment',
      entity_id: 'a1',
      ts: new Date().toISOString(),
      meta: { x: 1 }
    })).not.toThrow();
  });

  test('eventCreateRequest validates', () => {
    expect(() => eventCreateRequest.parse({ event_type: 't', entity_type: 'e', entity_id: 'id', meta: {} })).not.toThrow();
    expect(() => eventCreateRequest.parse({ event_type: '', entity_type: 'e', entity_id: 'id' } as any)).toThrow();
  });
});


