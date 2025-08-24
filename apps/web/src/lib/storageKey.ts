export function storageKey(input: { tenantId: string; product: 'education'|'expertfolio'; entity: string; id: string; filename: string }) {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${safe(input.tenantId)}/${safe(input.product)}/${safe(input.entity)}/${safe(input.id)}/${safe(input.filename)}`;
}


