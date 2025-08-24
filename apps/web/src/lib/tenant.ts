export type Product = 'education' | 'expertfolio';

const DEFAULT_EDU_TENANT = process.env.DEFAULT_EDU_TENANT_ID || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const DEFAULT_FOLIO_TENANT = process.env.DEFAULT_FOLIO_TENANT_ID || 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

export function resolveTenantFromHostOrPrefix(req: Request): { tenantId: string; product: Product } {
  try {
    const url = new URL((req as any).url || 'http://localhost/');
    const host = url.hostname || '';
    const isFolio = host.startsWith('folio.');
    if (isFolio) {
      return { tenantId: DEFAULT_FOLIO_TENANT, product: 'expertfolio' };
    }
    return { tenantId: DEFAULT_EDU_TENANT, product: 'education' };
  } catch {
    return { tenantId: DEFAULT_EDU_TENANT, product: 'education' };
  }
}
