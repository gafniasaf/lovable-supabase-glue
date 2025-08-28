
import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = {
      limit: clamp(parseInt(url.searchParams.get('limit')||'20',10), 1, 100),
      offset: Math.max(0, parseInt(url.searchParams.get('offset')||'0',10)),
      sortBy: url.searchParams.get('sortBy') || 'created_at',
      sortOrder: (url.searchParams.get('sortOrder') as 'asc'|'desc') || 'desc',
      actor_id: url.searchParams.get('actor_id') || undefined,
      action: url.searchParams.get('action') || undefined,
      entity_type: url.searchParams.get('entity_type') || undefined,
      from_date: url.searchParams.get('from_date') || undefined,
      to_date: url.searchParams.get('to_date') || undefined
    };

    // Build the query
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });

    // Apply filters
    if (q.actor_id) {
      query = query.eq('actor_id', q.actor_id);
    }
    if (q.action) {
      query = query.ilike('action', `%${q.action}%`);
    }
    if (q.entity_type) {
      query = query.eq('entity_type', q.entity_type);  
    }
    if (q.from_date) {
      query = query.gte('created_at', q.from_date);
    }
    if (q.to_date) {
      query = query.lte('created_at', q.to_date);
    }

    // Apply ordering and pagination
    query = query
      .order(q.sortBy, { ascending: q.sortOrder === 'asc' })
      .range(q.offset, q.offset + q.limit - 1);

    const { data: logs, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          error: { 
            code: 'DATABASE_ERROR', 
            message: 'Failed to fetch audit logs',
            statusCode: 500
          } 
        }, 
        { status: 500 }
      );
    }

    const response = {
      logs: logs || [],
      total: count || 0,
      limit: q.limit,
      offset: q.offset
    };

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': (count || 0).toString()
      }
    });

  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: err?.message || 'Unexpected error',
          statusCode: 500
        } 
      }, 
      { status: 500 }
    );
  }
}
