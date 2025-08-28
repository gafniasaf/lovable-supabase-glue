import { NextResponse } from 'next/server';

// Minimal stub API for Expertfolio Admin Audit Logs
// Returns a small page of demo data so the UI can render

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '20', 10)));
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));

    const now = new Date();
    const sample = [
      {
        id: '6f6ef2f0-7f6d-4a7d-9a3e-1c0e7a2d9a10',
        actor_id: 'admin-123',
        action: 'user.login',
        entity_type: 'auth',
        entity_id: null,
        created_at: new Date(now.getTime() - 60_000).toISOString()
      },
      {
        id: '8d736a18-8f8b-4a5d-b4a7-3d4e6c7f8a91',
        actor_id: 'system',
        action: 'files.cleanup',
        entity_type: 'file',
        entity_id: 'file_abc123',
        created_at: new Date(now.getTime() - 5 * 60_000).toISOString()
      },
      {
        id: 'a4b2c3d4-e5f6-47a8-9b0c-d1e2f3a4b5c6',
        actor_id: 'admin-123',
        action: 'user.update',
        entity_type: 'user',
        entity_id: 'user_42',
        created_at: new Date(now.getTime() - 15 * 60_000).toISOString()
      }
    ];

    const paged = sample.slice(offset, offset + limit);
    return NextResponse.json({ logs: paged, total: sample.length, limit, offset });
  } catch (err: any) {
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: err?.message || 'Unexpected error' }, { status: 500 });
  }
}


