export function createServerComponentClient() {
  return {
    auth: { getUser: async () => ({ data: { user: null } }) }
  } as any;
}

function makeChain(_tbl: string, params: Record<string, any> = {}) {
  const exec = async () => ({ data: params.insert || params.update || params.upsert || null, count: 0, error: null } as any);
  const chain: any = {
    select: (_sel?: string, _opts?: any) => makeChain(_tbl, params),
    eq: (k: string, v: any) => makeChain(_tbl, { ...params, [k]: v }),
    is: (k: string, v: any) => makeChain(_tbl, { ...params, [k]: v }),
    ilike: (k: string, v: any) => makeChain(_tbl, { ...params, [k]: v }),
    in: (k: string, v: any[]) => makeChain(_tbl, { ...params, [k]: v }),
    order: (_field: string, _opts?: any) => makeChain(_tbl, params),
    limit: (_n: number) => makeChain(_tbl, params),
    range: (_from: number, _to: number) => makeChain(_tbl, params),
    single: async () => ({ data: params.insert || params.update || params.upsert || null, error: null } as any),
    insert: (row: any) => makeChain(_tbl, { ...params, insert: row }),
    upsert: (row: any) => makeChain(_tbl, { ...params, upsert: row }),
    update: (row: any) => makeChain(_tbl, { ...params, update: row }),
    delete: () => makeChain(_tbl, { ...params, delete: true }),
    then: (onFulfilled: any, onRejected: any) => exec().then(onFulfilled, onRejected),
  };
  return chain;
}

export function createRouteHandlerClient() {
  return {
    auth: { getUser: async () => ({ data: { user: null } }) },
    from: (tbl: string) => ({
      select: (_sel?: string, _opts?: any) => makeChain(tbl, {}),
      is: (k: string, v: any) => makeChain(tbl, { [k]: v }),
      insert: (row: any) => makeChain(tbl, { insert: row }),
      upsert: (row: any) => makeChain(tbl, { upsert: row }),
      update: (row: any) => makeChain(tbl, { update: row }),
      delete: () => makeChain(tbl, { delete: true }),
    })
  } as any;
}

