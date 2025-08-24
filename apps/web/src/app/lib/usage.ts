import { getRouteHandlerSupabase } from "@/lib/supabaseServer";

type IncrementArgs = { metric: string; courseId: string; providerId: string | null; count: number; storageBytes: number; computeMinutes: number };

export async function incrementUsageCounter(args: IncrementArgs): Promise<void> {
  const supabase = getRouteHandlerSupabase();
  const { metric, courseId, providerId, count, storageBytes, computeMinutes } = args;
  try {
    const { data: existing } = await supabase.from('usage_counters').select('metric,course_id,provider_id,count,storage_bytes,compute_minutes').eq('metric', metric).eq('course_id', courseId).is('provider_id', providerId).single();
    if (existing) {
      const next = {
        count: Number((existing as any).count || 0) + count,
        storage_bytes: Number((existing as any).storage_bytes || 0) + storageBytes,
        compute_minutes: Number((existing as any).compute_minutes || 0) + computeMinutes,
      };
      await supabase.from('usage_counters').update(next).eq('metric', metric).eq('course_id', courseId).is('provider_id', providerId);
    } else {
      await supabase.from('usage_counters').insert({ metric, course_id: courseId, provider_id: providerId, count, storage_bytes: storageBytes, compute_minutes: computeMinutes });
    }
  } catch {}
}


