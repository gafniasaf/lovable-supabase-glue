
import { supabase } from '@/integrations/supabase/client';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export async function getAuditLogs(params: URLSearchParams) {
  const q = {
    limit: clamp(parseInt(params.get('limit')||'20',10), 1, 100),
    offset: Math.max(0, parseInt(params.get('offset')||'0',10)),
    sortBy: params.get('sortBy') || 'created_at',
    sortOrder: (params.get('sortOrder') as 'asc'|'desc') || 'desc',
    actor_id: params.get('actor_id') || undefined,
    action: params.get('action') || undefined,
    entity_type: params.get('entity_type') || undefined,
    from_date: params.get('from_date') || undefined,
    to_date: params.get('to_date') || undefined
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
    throw new Error(`Failed to fetch audit logs: ${error.message}`);
  }

  return {
    logs: logs || [],
    total: count || 0,
    limit: q.limit,
    offset: q.offset
  };
}

export async function getAuditLogById(id: string) {
  const { data: log, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Audit log not found');
    }
    throw new Error(`Failed to fetch audit log: ${error.message}`);
  }

  return log;
}
