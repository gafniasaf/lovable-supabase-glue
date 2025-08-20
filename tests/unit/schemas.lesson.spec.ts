import { lessonCreateRequest, lessonReorderRequest } from '@shared';

describe('lesson schemas', () => {
  test('validates lessonCreateRequest', () => {
    const result = lessonCreateRequest.safeParse({
      course_id: '11111111-1111-1111-1111-111111111111',
      title: 'Intro',
      content: 'Hello',
      order_index: 1
    });
    expect(result.success).toBe(true);
  });

  test('rejects short title', () => {
    const result = lessonCreateRequest.safeParse({
      course_id: '11111111-1111-1111-1111-111111111111',
      title: 'Hi',
      content: 'Hello',
      order_index: 1
    });
    expect(result.success).toBe(false);
  });

  test('validates lessonReorderRequest', () => {
    const result = lessonReorderRequest.safeParse({
      course_id: '11111111-1111-1111-1111-111111111111',
      items: [
        { id: '11111111-1111-1111-1111-111111111112', order_index: 2 },
        { id: '11111111-1111-1111-1111-111111111113', order_index: 1 }
      ]
    });
    expect(result.success).toBe(true);
  });
});


