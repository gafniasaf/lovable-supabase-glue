import { createInteractiveOutcomesGateway } from '../../apps/web/src/lib/data/interactiveOutcomes';

describe('Admin outcomes page CSV link (gateway URL)', () => {
  test('exportCsvUrl builds expected path', () => {
    const gw = createInteractiveOutcomesGateway();
    const id = '11111111-1111-1111-1111-111111111111';
    expect(gw.exportCsvUrl(id)).toBe(`/api/runtime/outcomes/export?course_id=${id}`);
  });
});


