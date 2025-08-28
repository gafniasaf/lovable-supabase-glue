import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ code: 'BAD_REQUEST', message: 'id required' }, { status: 400 });
    // Return a dummy URL (would be a signed URL in real impl)
    return NextResponse.json({ url: `/api/files/mock/${encodeURIComponent(id)}`, filename: `${id}.txt`, content_type: 'text/plain' });
  } catch (err: any) {
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: err?.message || 'Unexpected error' }, { status: 500 });
  }
}


