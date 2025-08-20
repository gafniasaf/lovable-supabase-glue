declare module "next/server" {
  export type NextRequest = Request;
  export const NextResponse: { json: (body: any, init?: any) => Response };
}

declare module "next/headers" {
  export function headers(): { get(name: string): string | null };
  export function cookies(): { get(name: string): { name: string; value: string } | undefined };
}

