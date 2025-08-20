import { parentLink, parentLinkCreateRequest, parentLinkDeleteRequest } from '@shared';

describe('parentLink schemas', () => {
  test('parentLink schema shape', () => {
    expect(() => parentLink.parse({
      id: '00000000-0000-0000-0000-000000000001',
      parent_id: '00000000-0000-0000-0000-000000000002',
      student_id: '00000000-0000-0000-0000-000000000003',
      created_at: new Date().toISOString()
    })).not.toThrow();
  });

  test('create and delete requests validate', () => {
    expect(() => parentLinkCreateRequest.parse({ parent_id: 'p-123', student_id: 's-456' })).not.toThrow();
    expect(() => parentLinkDeleteRequest.parse({ parent_id: 'p-123', student_id: 's-456' })).not.toThrow();
  });
});


