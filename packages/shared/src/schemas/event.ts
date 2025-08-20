import { z } from "zod";

export const event = z.object({
  id: z.string().uuid(),
  user_id: z.string().nullable(),
  event_type: z.string().min(1),
  entity_type: z.string().min(1),
  entity_id: z.string().min(1),
  ts: z.string(),
  meta: z.record(z.any())
});
export type Event = z.infer<typeof event>;

export const eventCreateRequest = z.object({
  event_type: z.string().min(1),
  entity_type: z.string().min(1),
  entity_id: z.string().min(1),
  meta: z.record(z.any()).default({})
});
export type EventCreateRequest = z.infer<typeof eventCreateRequest>;


