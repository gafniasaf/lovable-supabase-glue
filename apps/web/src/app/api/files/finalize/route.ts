import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    if (!body?.key || typeof body?.size_bytes !== 'number') {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'key and size_bytes required' }, { status: 400 });
    }
    // Accept the finalize request
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: err?.message || 'Unexpected error' }, { status: 500 });
  }
}


