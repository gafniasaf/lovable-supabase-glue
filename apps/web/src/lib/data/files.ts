import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";

export type FilesGateway = {
  getUploadUrl(input: { owner_type: string; owner_id: string; content_type: string; filename?: string }): Promise<{ url: string; method?: string; headers?: Record<string, string> }>;
  directTestUpload(input: { owner_type: string; owner_id: string; content_type: string; data: ArrayBuffer | Uint8Array }): Promise<{ id: string; url: string }>; // test-mode helper
  resolve(keys: string[]): Promise<Record<string, { filename: string | null; content_type: string | null; url: string | null }>>;
  deleteByKey(key: string): Promise<{ ok: true }>;
};

function buildHttpGateway(): FilesGateway {
  return {
    async getUploadUrl(input) {
      const schema = z.object({ url: z.string(), method: z.string().optional(), headers: z.record(z.string()).optional() });
      return fetchJson(`/api/files/upload-url`, schema, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input)
      });
    },
    async directTestUpload(input) {
      // Only works in test-mode where PUT is accepted
      const url = `/api/files/upload-url?owner_type=${encodeURIComponent(input.owner_type)}&owner_id=${encodeURIComponent(input.owner_id)}&content_type=${encodeURIComponent(input.content_type)}`;
      const res = await fetch(url, { method: "PUT", body: input.data as any, headers: { "content-type": input.content_type } });
      const json = await res.json();
      return z.object({ id: z.string(), url: z.string() }).parse(json);
    },
    async resolve(keys) {
      const schema = z.record(z.object({ filename: z.string().nullable(), content_type: z.string().nullable(), url: z.string().nullable() }));
      if (typeof window === 'undefined') {
        return fetchJson(`/api/files/resolve`, schema, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ keys })
        });
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/files/resolve`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ keys }),
          cache: 'no-store'
        });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return schema.parse(json);
      }
    },
    async deleteByKey(key) {
      await fetchJson(`/api/files/attachment?key=${encodeURIComponent(key)}`, z.object({ ok: z.boolean() }), { method: "DELETE" });
      return { ok: true } as const;
    }
  };
}

function buildTestGateway(): FilesGateway {
  return buildHttpGateway();
}

export function createHttpGateway(): FilesGateway {
  return buildHttpGateway();
}

export function createTestGateway(): FilesGateway {
  return buildTestGateway();
}

export function createFilesGateway(): FilesGateway {
  return isTestMode() ? createTestGateway() : createHttpGateway();
}


