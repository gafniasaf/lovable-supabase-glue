import { announcement, announcementCreateRequest, announcementDeleteRequest } from '@shared';

describe('announcement schemas', () => {
  test('announcementCreateRequest valid', () => {
    const v = announcementCreateRequest.parse({
      course_id: '00000000-0000-0000-0000-000000000001',
      title: 'Welcome',
      body: 'Hello students',
      publish_at: null
    });
    expect(v.title).toBe('Welcome');
  });

  test('announcementCreateRequest invalid when missing fields', () => {
    expect(() => announcementCreateRequest.parse({
      course_id: '00000000-0000-0000-0000-000000000001',
      title: '',
      body: ''
    } as any)).toThrow();
  });

  test('announcement schema shape', () => {
    expect(() => announcement.parse({
      id: '00000000-0000-0000-0000-000000000001',
      course_id: '00000000-0000-0000-0000-000000000001',
      teacher_id: '00000000-0000-0000-0000-000000000002',
      title: 'Title',
      body: 'Body',
      publish_at: null,
      created_at: new Date().toISOString()
    })).not.toThrow();
  });

  test('announcementDeleteRequest validates id', () => {
    expect(() => announcementDeleteRequest.parse({ id: '00000000-0000-0000-0000-000000000001' })).not.toThrow();
    expect(() => announcementDeleteRequest.parse({ id: 'bad-id' } as any)).toThrow();
  });
});


