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
      select: (_sel?: string) => chain(tbl, { ...params, select: true }),
      eq: (k: string, v: any) => chain(tbl, { ...params, [k]: v, eq: { ...(params as any).eq, [k]: v } }),
      is: (k: string, v: any) => chain(tbl, { ...params, [k]: v }),
      in: (k: string, v: any[]) => chain(tbl, { ...params, [k]: v }),
      order: (_field: string, _opts?: any) => chain(tbl, params),
      limit: (_n: number) => chain(tbl, params),
      range: (_from: number, _to: number) => chain(tbl, params),
      insert: (row: any) => chain(tbl, { ...params, insert: row }),
      upsert: (row: any) => chain(tbl, { ...params, upsert: row }),
      update: (row: any) => chain(tbl, { ...params, update: row }),
      delete: () => chain(tbl, { ...params, delete: true }),
      single: async () => await exec(tbl, params),
      then: (onFulfilled: any, onRejected: any) => exec(tbl, params).then(onFulfilled, onRejected),
    };
    return obj;
  };
  return {
    from: (tbl: string) => ({
      select: (_sel?: string) => chain(tbl, { select: true }),
      // Allow chaining .is right after initial select for patterns like select(...).is(...)
      is: (k: string, v: any) => chain(tbl, { [k]: v }),
      insert: (row: any) => chain(tbl, { insert: row }),
      upsert: (row: any) => chain(tbl, { upsert: row }),
      update: (row: any) => chain(tbl, { update: row }),
      delete: () => chain(tbl, { delete: true }),
    }),
    // Minimal storage mock for createSignedUrl and createSignedUploadUrl used in routes
    storage: {
      from: (_bucket: string) => ({
        createSignedUrl: async (_objectKey: string, _expires: number) => ({ data: { signedUrl: `/test-signed/${encodeURIComponent(_objectKey)}` }, error: null }),
        createSignedUploadUrl: async (_objectKey: string, _expires: number, _opts?: any) => ({ data: { url: `/test-upload/${encodeURIComponent(_objectKey)}`, path: _objectKey }, error: null }),
        list: async (_prefix: string, _opts?: any) => ({ data: [], error: null }),
        remove: async (_files: any[]) => ({ data: true, error: null })
      })
    }
  } as any;
}

// Re-export server helper so tests can spyOn via this module, while routes call into this module's export at runtime.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const real = require('@/lib/supabaseServer');
const orig_getRouteHandlerSupabase = (real as any).getRouteHandlerSupabase;
const orig_getCurrentUserInRoute = (real as any).getCurrentUserInRoute;

// Our exported functions default to the original real implementations.
export function getRouteHandlerSupabase(...args: any[]) {
  return orig_getRouteHandlerSupabase?.(...args);
}
export function getCurrentUserInRoute(...args: any[]) {
  return orig_getCurrentUserInRoute?.(...args);
}

// Point the real module functions to call back into this module's exports at call time.
try {
  (real as any).getRouteHandlerSupabase = (...a: any[]) => (exports as any).getRouteHandlerSupabase(...a);
  (real as any).getCurrentUserInRoute = (...a: any[]) => (exports as any).getCurrentUserInRoute(...a);
} catch {}

export const __supabaseExports = {
  getRouteHandlerSupabase: (real as any).getRouteHandlerSupabase,
  getCurrentUserInRoute: (real as any).getCurrentUserInRoute,
};

// Note: Avoid property getter indirection to prevent recursive getter loops.


