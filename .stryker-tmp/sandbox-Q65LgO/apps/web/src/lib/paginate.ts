// @ts-nocheck
export type PageRequest = { offset?: number; limit?: number };
export type PageResult<T> = { rows: T[]; total?: number };

export function buildPagedResult<T>(rows: T[], headers?: Headers): PageResult<T> {
  return { rows, total: headers ? parseTotalCount(headers) : undefined };
}

export function toQuery({ offset = 0, limit = 50 }: PageRequest = {}): string {
  const qs = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  return `?${qs.toString()}`;
}

export function parseTotalCount(headers: Headers): number | undefined {
  const raw = headers.get('x-total-count');
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}


