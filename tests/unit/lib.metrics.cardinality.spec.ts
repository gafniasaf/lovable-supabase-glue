import { recordTiming, snapshot } from '../../apps/web/src/lib/metrics';

describe('metrics label cardinality guard', () => {
  test('UUID segments are collapsed to :id', () => {
    const path = 'http://localhost/api/courses/00000000-0000-0000-0000-000000000001/transfer-owner';
    recordTiming(path, 10);
    const snap = snapshot();
    const keys = Object.keys(snap);
    const key = keys.find(k => k.includes('/api/courses/') && k.includes('/transfer-owner')) || '';
    expect(key.includes(':id')).toBeTruthy();
  });
});


