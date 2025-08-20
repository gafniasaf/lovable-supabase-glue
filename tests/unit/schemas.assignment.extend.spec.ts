import { assignmentCreateRequest } from '@shared';

describe('assignment schema defaults/bounds', () => {
  test('points allows omission', () => {
    const v = assignmentCreateRequest.parse({ course_id: '00000000-0000-0000-0000-000000000001', title: 'Assignment' });
    expect(v.points).toBeUndefined();
  });
});


