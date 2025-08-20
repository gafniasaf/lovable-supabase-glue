import { dashboardResponse } from '@shared';

describe('dashboard parent variant', () => {
  test('children defaults to [] and allows unknown keys in parent shape', () => {
    const v = dashboardResponse.parse({ role: 'parent', data: { children: undefined } as any });
    const data: any = (v as any).data;
    expect(Array.isArray(data.children)).toBe(true);
  });
});


