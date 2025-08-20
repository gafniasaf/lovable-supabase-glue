export type SupabaseSelectResult = { data: any; error: any } | Promise<{ data: any; error: any }>;

export function supabaseError(message = 'db failed'): SupabaseSelectResult {
  return { data: null, error: { message } } as any;
}

export function supabaseOk(data: any): SupabaseSelectResult {
  return { data, error: null } as any;
}

/**
 * Build a minimal chainable supabase mock supporting `.from(tbl).select(...).eq(...).in(...).order(...).limit(...).single()`.
 * The resolver map keys are table names; values are handlers returning { data, error }.
 */
export function makeSupabaseMock(resolvers: Record<string, (params: Record<string, any>) => SupabaseSelectResult>) {
  const exec = async (tbl: string, params: Record<string, any>) => {
    const out = await (resolvers[tbl]?.(params) ?? supabaseOk(null));
    // Normalize to { data, count, error } shape when needed
    if (out && typeof out === 'object' && 'data' in out && 'error' in out) {
      return out as any;
    }
    return { data: out, count: 0, error: null } as any;
  };
  const chain = (tbl: string, params: Record<string, any> = {}) => {
    const obj: any = {
      select: (_sel?: string) => chain(tbl, params),
      eq: (k: string, v: any) => chain(tbl, { ...params, [k]: v }),
      is: (k: string, v: any) => chain(tbl, { ...params, [k]: v }),
      in: (k: string, v: any[]) => chain(tbl, { ...params, [k]: v }),
      order: (_field: string, _opts?: any) => chain(tbl, params),
      limit: (_n: number) => chain(tbl, params),
      range: (_from: number, _to: number) => chain(tbl, params),
      insert: (row: any) => chain(tbl, { ...params, insert: row }),
      update: (row: any) => chain(tbl, { ...params, update: row }),
      delete: () => chain(tbl, { ...params, delete: true }),
      single: async () => await exec(tbl, params),
      then: (onFulfilled: any, onRejected: any) => exec(tbl, params).then(onFulfilled, onRejected),
    };
    return obj;
  };
  return {
    from: (tbl: string) => ({
      select: (_sel?: string) => chain(tbl, {}),
      // Allow chaining .is right after initial select for patterns like select(...).is(...)
      is: (k: string, v: any) => chain(tbl, { [k]: v }),
      insert: (row: any) => chain(tbl, { insert: row }),
      update: (row: any) => chain(tbl, { update: row }),
      delete: () => chain(tbl, { delete: true }),
    }),
  } as any;
}

// Re-export server helper so tests can spyOn this symbol uniformly via the supabaseMock module.
// This allows: jest.spyOn(supa, 'getRouteHandlerSupabase').mockReturnValue(mock)
export { getRouteHandlerSupabase } from '../../apps/web/src/lib/supabaseServer';


