import type { Preview } from "@storybook/react";
import React from "react";
import { setupWorker } from "msw/browser";
import { http, HttpResponse } from "msw";
import { GatewayProvider } from "../src/lib/data/GatewayProvider";

// Ensure TEST_MODE is effectively on for gateways relying on it.
// In Storybook, we mock API responses or render against in-memory data.
try { (process as any).env.TEST_MODE = "1"; } catch {}
try { (process as any).env.NEXT_PUBLIC_TEST_MODE = "1"; } catch {}
try { (window as any).__TEST_MODE__ = true; } catch {}

// Minimal MSW setup for common endpoints used by stories/components
type Notif = { id: string; type: string; payload?: any; created_at: string; read_at?: string | null };
function makeNotifStore() {
  const count = (window as any).__NOTIF_COUNT__ || 8;
  const arr: Notif[] = Array.from({ length: count }).map((_, i) => ({
    id: `nnnnnnnn-nnnn-nnnn-nnnn-${String(100000000000 + i)}`,
    type: i % 2 ? "submission:graded" : "message:new",
    payload: i % 2 ? { score: 90 } : { thread_id: `tttttttt-tttt-tttt-tttt-${String(100000000000 + i)}` },
    created_at: new Date(Date.now() - i * 3600_000).toISOString(),
    read_at: i < 2 ? null : new Date(Date.now() - i * 3600_000).toISOString()
  }));
  return arr;
}
let notifStore: Notif[] = makeNotifStore();

const worker = setupWorker(
  // Notifications list
  http.get("/api/notifications", ({ request }) => {
    if ((window as any).__FORCE_ERROR__) return new HttpResponse(null, { status: 500 });
    const url = new URL(request.url);
    const offset = Math.max(0, parseInt(url.searchParams.get("offset") || "0", 10) || 0);
    const limit = Math.max(1, Math.min(200, parseInt(url.searchParams.get("limit") || "100", 10) || 100));
    notifStore = makeNotifStore();
    const slice = notifStore.slice(offset, offset + limit);
    return HttpResponse.json(slice, { headers: { "x-total-count": String(notifStore.length) } });
  }),
  // Notifications mark read
  http.patch("/api/notifications", ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (id) {
      const idx = notifStore.findIndex(n => n.id === id);
      if (idx >= 0) notifStore[idx] = { ...notifStore[idx], read_at: new Date().toISOString() };
      return HttpResponse.json(notifStore[idx] ?? null);
    }
    return new HttpResponse(null, { status: 400 });
  }),
  // Quiz attempts
  http.post("/api/quiz-attempts", async ({ request }) => {
    const body = await request.json().catch(() => ({} as any));
    return HttpResponse.json({ id: `attempt-${Math.floor(Math.random() * 100000)}`, quiz_id: body?.quiz_id || "quiz" });
  }),
  http.patch("/api/quiz-attempts", () => HttpResponse.json({ ok: true })),
  http.post("/api/quiz-attempts/submit", async ({ request }) => {
    const body = await request.json().catch(() => ({} as any));
    return HttpResponse.json({ id: body?.attempt_id || "attempt-1", submitted_at: new Date().toISOString() });
  }),
  // Runtime exchange and events
  http.post('/api/runtime/auth/exchange', async ({ request }) => {
    const body = await request.json().catch(() => ({} as any));
    return HttpResponse.json({ runtimeToken: `rt-${(body?.token || '').slice(0, 6)}`, expiresAt: new Date(Date.now() + 5 * 60_000).toISOString() });
  }),
  http.post('/api/runtime/events', async () => {
    return HttpResponse.json({ ok: true });
  }),
  // Files upload-url (test-mode style)
  http.post("/api/files/upload-url", async ({ request }) => {
    const body = await request.json().catch(() => ({} as any));
    const url = `/api/files/upload-url?owner_type=${encodeURIComponent(body?.owner_type || 'user')}&owner_id=${encodeURIComponent(body?.owner_id || 'self')}&content_type=${encodeURIComponent(body?.content_type || 'application/octet-stream')}`;
    return HttpResponse.json({ url });
  }),
  // User profile
  http.get("/api/user/profile", () => {
    return HttpResponse.json({ id: "user-1", email: "student@example.com", role: "student", display_name: "Student", avatar_url: null, bio: "", preferences: {} });
  }),
  http.put("/api/user/profile", async () => {
    return HttpResponse.json({ ok: true });
  }),
  // Reports (JSON)
  http.get('/api/reports/engagement', ({ request }) => {
    const url = new URL(request.url);
    const courseId = url.searchParams.get('course_id');
    return HttpResponse.json({ lessons: 12, assignments: 7, submissions: 19 });
  }),
  http.get('/api/reports/grade-distribution', ({ request }) => {
    const url = new URL(request.url);
    const format = url.searchParams.get('format');
    if (format === 'csv') {
      return new HttpResponse('bucket,count\n90-100,10\n80-89,15\n70-79,9\n0-69,8\n', { headers: { 'content-type': 'text/csv' } });
    }
    return HttpResponse.json({ total: 42, average: 84, dist: [ { bucket: '90-100', count: 10 }, { bucket: '80-89', count: 15 }, { bucket: '70-79', count: 9 }, { bucket: '0-69', count: 8 } ] });
  })
);

// Start worker once
worker.start({ onUnhandledRequest: "bypass" });

export const globalTypes = {
  testRole: {
    name: 'Role',
    description: 'Test role for gateways',
    defaultValue: 'student',
    toolbar: {
      icon: 'user',
      items: ['student', 'teacher', 'parent', 'admin']
    }
  },
  scenario: {
    name: 'Scenario',
    description: 'Mock scenario',
    defaultValue: 'default',
    toolbar: { icon: 'circlehollow', items: ['default', 'large', 'error'] }
  }
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    a11y: {
      element: "#root",
      manual: false
    }
  },
  globals: {
    testRole: 'student'
  },
  decorators: [
    (Story, ctx) => {
      try { document.cookie = `x-test-auth=${ctx.globals.testRole || 'student'}; path=/`; } catch {}
      // Adjust MSW datasets for scenarios
      if (ctx.globals.scenario === 'large') {
        // Increase notifications count
        try { (window as any).__NOTIF_COUNT__ = 200; } catch {}
      } else if (ctx.globals.scenario === 'error') {
        // Force errors on some endpoints
        // Note: simplistic flag checked by handlers
        try { (window as any).__FORCE_ERROR__ = true; } catch {}
      } else {
        try { (window as any).__NOTIF_COUNT__ = 8; (window as any).__FORCE_ERROR__ = false; } catch {}
      }
      return (
        <GatewayProvider mode="test">
          <Story />
        </GatewayProvider>
      );
    }
  ]
};

export default preview;


