// @ts-nocheck
import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";

export type AnnouncementRow = { id: string; course_id: string; title: string; body: string; created_at: string; file_key?: string | null };

const announcementSchema = z.object({ id: z.string(), course_id: z.string(), title: z.string(), body: z.string(), created_at: z.string(), file_key: z.string().nullable().optional() });

export type AnnouncementsGateway = {
  listByCourse(courseId: string): Promise<AnnouncementRow[]>;
  create(input: { course_id: string; title: string; body: string; publish_at?: string | null; file_key?: string | null }): Promise<AnnouncementRow>;
  delete(id: string): Promise<{ ok: true }>;
};

function buildHttpGateway(): AnnouncementsGateway {
  return {
    async listByCourse(courseId) {
      return fetchJson(`/api/announcements?course_id=${encodeURIComponent(courseId)}`, z.array(announcementSchema));
    },
    async create(input) {
      return fetchJson(`/api/announcements`, announcementSchema, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
    },
    async delete(id) {
      await fetchJson(`/api/announcements?id=${encodeURIComponent(id)}`, z.object({ ok: z.boolean() }), { method: 'DELETE' });
      return { ok: true } as const;
    }
  };
}

function buildTestGateway(): AnnouncementsGateway { return buildHttpGateway(); }
export function createHttpGateway(): AnnouncementsGateway { return buildHttpGateway(); }
export function createTestGateway(): AnnouncementsGateway { return buildTestGateway(); }
export function createAnnouncementsGateway(): AnnouncementsGateway { return isTestMode() ? createTestGateway() : createHttpGateway(); }
