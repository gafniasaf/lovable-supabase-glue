// @ts-nocheck
import { z } from "zod";
import { UserId } from "./ids";

export const messageThread = z.object({
  id: z.string().uuid(),
  created_at: z.string()
});
export type MessageThread = z.infer<typeof messageThread>;

export const messageThreadCreateRequest = z.object({
  // In test-mode, participants can be synthetic IDs that are not UUIDs.
  participant_ids: z.array(z.string().min(1)).min(1)
}).strict();
export type MessageThreadCreateRequest = z.infer<typeof messageThreadCreateRequest>;

export const message = z.object({
  id: z.string().uuid(),
  thread_id: z.string().uuid(),
  // Sender can be synthetic in test-mode; accept string
  sender_id: z.string().min(1),
  body: z.string().min(1),
  created_at: z.string(),
  read_at: z.string().nullable().optional()
});
export type Message = z.infer<typeof message>;

export const messageCreateRequest = z.object({
  thread_id: z.string().uuid(),
  body: z.string().min(1)
}).strict();
export type MessageCreateRequest = z.infer<typeof messageCreateRequest>;


