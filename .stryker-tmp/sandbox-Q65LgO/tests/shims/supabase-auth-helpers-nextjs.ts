// @ts-nocheck
export function createServerComponentClient() {
  return {
    auth: { getUser: async () => ({ data: { user: null } }) }
  } as any;
}
export function createRouteHandlerClient() {
  return {
    auth: { getUser: async () => ({ data: { user: null } }) },
    from: (_: string) => ({ select: () => ({ then: (f: any) => f({ data: null, error: null }) }) })
  } as any;
}

