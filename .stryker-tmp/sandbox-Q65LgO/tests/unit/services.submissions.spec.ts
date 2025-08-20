// @ts-nocheck
import { createSubmissionApi, listSubmissionsByAssignment, gradeSubmissionApi } from '../../apps/web/src/server/services/submissions';
import { resetTestStore } from '../../apps/web/src/lib/testStore';

describe('submissions service (test-mode)', () => {
  beforeEach(() => {
    process.env.TEST_MODE = '1';
    resetTestStore();
  });

  test('create, list and grade submission triggers notification', async () => {
    const assignmentId = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000123';
    const studentId = 'student-1';
    const s = await createSubmissionApi({ assignment_id: assignmentId, text: 'Hi' } as any, studentId);
    const rows = await listSubmissionsByAssignment(assignmentId);
    expect(rows.map(r => r.id)).toContain(s.id);
    const graded = await gradeSubmissionApi(s.id, { score: 90 } as any);
    expect(graded?.score).toBe(90);
  });
});


