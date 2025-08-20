// @ts-nocheck
import { getDashboardForUser } from "../../apps/web/src/server/services/dashboard";

describe('dashboard DTO validation', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });
  test('teacher returns validated DTO', async () => {
    const dto = await getDashboardForUser('teacher-1', 'teacher');
    expect(dto.role).toBe('teacher');
    if (dto.role === 'teacher') {
      expect(dto.data.kpis.activeCourses.value).toBeGreaterThanOrEqual(0);
    } else {
      throw new Error('expected teacher role');
    }
  });
});


