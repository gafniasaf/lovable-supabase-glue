import { describe, it, expect, beforeEach } from '@jest/globals';

describe('tenant resolver', () => {
  beforeEach(() => { jest.resetModules(); });

  it('maps folio.* to expertfolio product', async () => {
    const mod = await import('../../apps/web/src/lib/tenant');
    const req = new Request('http://folio.example.com/api/x');
    const out = mod.resolveTenantFromHostOrPrefix(req as any);
    expect(out.product).toBe('expertfolio');
    expect(typeof out.tenantId).toBe('string');
  });

  it('maps other hosts to education product', async () => {
    const mod = await import('../../apps/web/src/lib/tenant');
    const req = new Request('http://app.example.com/api/x');
    const out = mod.resolveTenantFromHostOrPrefix(req as any);
    expect(out.product).toBe('education');
  });
});
