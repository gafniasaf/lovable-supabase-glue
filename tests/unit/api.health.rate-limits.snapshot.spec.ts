import { GET as HealthGET } from '../../apps/web/src/app/api/health/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/health includes rateLimits snapshot', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('returns rateLimits with configured values', async () => {
    process.env = {
      ...orig,
      MESSAGES_LIST_LIMIT: '240',
      MESSAGES_LIST_WINDOW_MS: '60000',
      UPLOAD_RATE_LIMIT: '30',
      UPLOAD_RATE_WINDOW_MS: '60000',
      RUNTIME_PROGRESS_LIMIT: '60',
      RUNTIME_PROGRESS_WINDOW_MS: '60000',
      RUNTIME_GRADE_LIMIT: '60',
      RUNTIME_GRADE_WINDOW_MS: '60000',
      RUNTIME_CHECKPOINT_LIMIT: '30',
      RUNTIME_CHECKPOINT_WINDOW_MS: '60000',
      RUNTIME_ASSET_LIMIT: '20',
      RUNTIME_ASSET_WINDOW_MS: '60000',
      RUNTIME_OUTCOMES_LIMIT: '60',
      RUNTIME_OUTCOMES_WINDOW_MS: '60000',
      GLOBAL_MUTATION_RATE_LIMIT: '100',
      GLOBAL_MUTATION_RATE_WINDOW_MS: '60000',
      REPORTS_ACTIVITY_LIMIT: '240',
      REPORTS_ACTIVITY_WINDOW_MS: '60000',
      REPORTS_RETENTION_LIMIT: '120',
      REPORTS_RETENTION_WINDOW_MS: '60000'
    } as any;
    const res = await (HealthGET as any)(get('http://localhost/api/health'));
    expect(res.ok).toBeTruthy();
    const json = await res.json();
    expect(json.rateLimits).toBeTruthy();
    expect(json.rateLimits.RUNTIME_PROGRESS_LIMIT).toBe('60');
    expect(json.rateLimits.MESSAGES_LIST_LIMIT).toBe('240');
    expect(json.rateLimits.GLOBAL_MUTATION_RATE_LIMIT).toBe('100');
    expect(json.rateLimits.REPORTS_ACTIVITY_LIMIT).toBe('240');
    expect(json.rateLimits.REPORTS_RETENTION_LIMIT).toBe('120');
  });
});


