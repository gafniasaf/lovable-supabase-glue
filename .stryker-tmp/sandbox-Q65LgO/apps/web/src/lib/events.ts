// @ts-nocheck
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";

export type AppEvent = {
  event_type: string;
  entity_type: string;
  entity_id: string;
  user_id?: string | null;
  meta?: Record<string, unknown> | null;
};

const memoryEvents: AppEvent[] = [];

export function getInMemoryEvents(): AppEvent[] {
  return [...memoryEvents];
}

export async function recordEvent(ev: AppEvent): Promise<void> {
  if (isTestMode()) {
    memoryEvents.push({ ...ev });
    return;
  }
  const supabase = getRouteHandlerSupabase();
  try {
    await supabase
      .from('events')
      .insert({
        user_id: ev.user_id ?? null,
        event_type: ev.event_type,
        entity_type: ev.entity_type,
        entity_id: ev.entity_id,
        meta: ev.meta ?? {},
      });
  } catch {}
}


