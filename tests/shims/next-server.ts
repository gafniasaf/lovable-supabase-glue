export type NextRequest = Request;

export class NextResponse extends Response {
  cookies: { set: (name: string, value: string, opts?: any) => void; get: (name: string) => any };
  private __cookieStore: Map<string, any>;
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body as any, init);
    this.__cookieStore = new Map<string, any>();
    (this as any).cookies = {
      set: (name: string, value: string, _opts?: any) => this.__cookieStore.set(name, { name, value }),
      get: (name: string) => this.__cookieStore.get(name) || null
    };
  }
  static json(body: any, init?: any) {
    const res = new NextResponse(JSON.stringify(body), {
      ...(init || {}),
      headers: { 'content-type': 'application/json', ...(init?.headers || {}) }
    } as any);
    return res as any;
  }
  static next(init?: any) {
    const res = new NextResponse(null, { ...(init || {}), headers: { ...(init?.headers || {}) } } as any);
    return res as any;
  }
}

