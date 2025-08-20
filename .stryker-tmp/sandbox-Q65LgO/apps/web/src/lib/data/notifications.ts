// @ts-nocheck
import { z } from "zod";
import { notification } from "@education/shared";

export type NotificationsGateway = {
  list(offset?: number, limit?: number): Promise<z.infer<typeof notification>[]>;
  markRead(id: string): Promise<z.infer<typeof notification>>;
  markAllRead(): Promise<{ ok: true }>;
  getPreferences(): Promise<Record<string, boolean>>;
  updatePreferences(prefs: Record<string, boolean>): Promise<Record<string, boolean>>;
};

function buildHttpGateway(): NotificationsGateway {
  return {
    async list(offset = 0, limit = 100) {
      if (typeof window === 'undefined') {
        const { fetchJson } = await import("@/lib/serverFetch");
        return fetchJson(`/api/notifications?offset=${offset}&limit=${limit}`, z.array(notification));
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const url = `${base}/api/notifications?offset=${offset}&limit=${limit}`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return z.array(notification).parse(json);
      }
    },
    async markRead(id) {
      if (typeof window === 'undefined') {
        const { fetchJson } = await import("@/lib/serverFetch");
        return fetchJson(`/api/notifications?id=${encodeURIComponent(id)}`, notification, { method: "PATCH" });
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const url = `${base}/api/notifications?id=${encodeURIComponent(id)}`;
        const res = await fetch(url, { method: 'PATCH', cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return notification.parse(json);
      }
    },
    async markAllRead() {
      if (typeof window === 'undefined') {
        const { fetchJson } = await import("@/lib/serverFetch");
        await fetchJson(`/api/notifications/read-all`, z.object({ ok: z.boolean() }), { method: "PATCH" });
        return { ok: true } as const;
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const url = `${base}/api/notifications/read-all`;
        const res = await fetch(url, { method: 'PATCH', cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { ok: true } as const;
      }
    },
    async getPreferences() {
      if (typeof window === 'undefined') {
        const { fetchJson } = await import("@/lib/serverFetch");
        return fetchJson(`/api/notifications/preferences`, z.record(z.boolean()));
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const url = `${base}/api/notifications/preferences`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return z.record(z.boolean()).parse(json);
      }
    },
    async updatePreferences(prefs) {
      if (typeof window === 'undefined') {
        const { fetchJson } = await import("@/lib/serverFetch");
        return fetchJson(`/api/notifications/preferences`, z.record(z.boolean()), {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(prefs)
        });
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const url = `${base}/api/notifications/preferences`;
        const res = await fetch(url, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(prefs),
          cache: 'no-store'
        });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return z.record(z.boolean()).parse(json);
      }
    }
  };
}

function buildTestGateway(): NotificationsGateway {
  return buildHttpGateway();
}

export function createHttpGateway(): NotificationsGateway {
  return buildHttpGateway();
}

export function createTestGateway(): NotificationsGateway {
  return buildTestGateway();
}

export function createNotificationsGateway(): NotificationsGateway {
  return createHttpGateway();
}


