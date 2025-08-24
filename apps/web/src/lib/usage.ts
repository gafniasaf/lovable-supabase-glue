export async function incrementUsageCounter(params: { metric: string; courseId?: string | null; providerId?: string | null; count?: number; storageBytes?: number; computeMinutes?: number }) {
  try {
    const mod = await import('@/lib/supabaseServer');
    const supabase = mod.getRouteHandlerSupabase();
    const metric = params.metric;
    const course_id = params.courseId ?? null;
    const provider_id = params.providerId ?? null;
    const count = params.count ?? 1;
    const storage_bytes = params.storageBytes ?? 0;
    const compute_minutes = params.computeMinutes ?? 0;
    const sel = supabase
      .from('usage_counters')
      .select('count,storage_bytes,compute_minutes')
      .eq('metric', metric)
      .eq('course_id', course_id as any)
      .eq('provider_id', provider_id as any);
    const { data: row } = await (sel as any).single();
    const next = {
      metric,
      course_id,
      provider_id,
      count: (row?.count ?? 0) + count,
      storage_bytes: (row?.storage_bytes ?? 0) + storage_bytes,
      compute_minutes: (row?.compute_minutes ?? 0) + compute_minutes,
    } as any;
    await (supabase as any).from('usage_counters').upsert(next);
  } catch {}
}


