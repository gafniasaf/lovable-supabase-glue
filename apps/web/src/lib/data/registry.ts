import { z } from "zod";
import { serverFetch } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";
import { externalCourse, courseVersion } from "@education/shared";

export type RegistryGateway = {
  listCourses(params: { q?: string; status?: string; kind?: string; page?: number; page_size?: number }): Promise<{ rows: z.infer<typeof externalCourse>[]; totalCount: number }>;
  getCourse(id: string): Promise<z.infer<typeof externalCourse> | null>;
  createCourse(input: { title: string; kind: 'v1' | 'v2'; version: string; status?: 'draft' | 'approved' | 'disabled'; description?: string | null; launch_url?: string | null }): Promise<z.infer<typeof externalCourse>>;
  updateCourse(id: string, input: Partial<z.infer<typeof externalCourse>> & { status?: 'draft' | 'approved' | 'disabled'; vendor_id?: string | null; title?: string; description?: string | null }): Promise<z.infer<typeof externalCourse>>;
  deleteCourse(id: string): Promise<{ ok: true }>;
  listVersions(external_course_id: string): Promise<z.infer<typeof courseVersion>[]>;
  createVersion(input: { external_course_id: string; version: string; status?: 'draft' | 'approved' | 'disabled'; launch_url?: string | null }): Promise<z.infer<typeof courseVersion>>;
  updateVersion(id: string, input: { status?: 'draft' | 'approved' | 'disabled' }): Promise<z.infer<typeof courseVersion>>;
  deleteVersion(id: string): Promise<{ ok: true }>;
};

function buildHttpGateway(): RegistryGateway {
  return {
    async listCourses(params) {
      const qs = new URLSearchParams();
      if (params.q) qs.set('q', params.q);
      if (params.status) qs.set('status', params.status);
      if (params.kind) qs.set('kind', params.kind);
      if (params.page != null) qs.set('page', String(params.page));
      if (params.page_size != null) qs.set('page_size', String(params.page_size));
      if (typeof window === 'undefined') {
        const res = await serverFetch(`/api/registry/courses${qs.toString() ? `?${qs.toString()}` : ''}`, { cache: 'no-store' });
        const text = await res.text();
        const json = text ? JSON.parse(text) : [];
        const rows = z.array(externalCourse).parse(json);
        const totalCount = Number(res.headers.get('x-total-count') || rows.length || 0);
        return { rows, totalCount };
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/registry/courses${qs.toString() ? `?${qs.toString()}` : ''}`, { cache: 'no-store' });
        const json = await res.json().catch(() => []);
        const rows = z.array(externalCourse).parse(json);
        const totalCount = Number(res.headers.get('x-total-count') || rows.length || 0);
        return { rows, totalCount };
      }
    },
    async updateCourse(id, input) {
      if (typeof window === 'undefined') {
        const res = await serverFetch(`/api/registry/courses?id=${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
        const json = await res.json();
        return externalCourse.parse(json);
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/registry/courses?id=${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input), cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return externalCourse.parse(json);
      }
    },
    async getCourse(id) {
      if (typeof window === 'undefined') {
        const res = await serverFetch(`/api/registry/courses?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
        const json = await res.json();
        const rows = Array.isArray(json) ? json : [json];
        const parsed = z.array(externalCourse).safeParse(rows);
        if (!parsed.success) return null;
        return parsed.data[0] ?? null;
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/registry/courses?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const rows = Array.isArray(json) ? json : [json];
        const parsed = z.array(externalCourse).safeParse(rows);
        if (!parsed.success) return null;
        return parsed.data[0] ?? null;
      }
    },
    async createCourse(input) {
      if (typeof window === 'undefined') {
        const res = await serverFetch(`/api/registry/courses`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
        const json = await res.json();
        return externalCourse.parse(json);
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/registry/courses`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input), cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return externalCourse.parse(json);
      }
    },
    async deleteCourse(id) {
      if (typeof window === 'undefined') {
        await serverFetch(`/api/registry/courses?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/registry/courses?id=${encodeURIComponent(id)}`, { method: 'DELETE', cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      return { ok: true } as const;
    },
    async listVersions(external_course_id) {
      if (typeof window === 'undefined') {
        const res = await serverFetch(`/api/registry/versions?external_course_id=${encodeURIComponent(external_course_id)}`, { cache: 'no-store' });
        const json = await res.json();
        return z.array(courseVersion).parse(json);
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/registry/versions?external_course_id=${encodeURIComponent(external_course_id)}`, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return z.array(courseVersion).parse(json);
      }
    },
    async createVersion(input) {
      if (typeof window === 'undefined') {
        const res = await serverFetch(`/api/registry/versions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
        const json = await res.json();
        return courseVersion.parse(json);
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/registry/versions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input), cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return courseVersion.parse(json);
      }
    },
    async updateVersion(id, input) {
      if (typeof window === 'undefined') {
        const res = await serverFetch(`/api/registry/versions?id=${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
        const json = await res.json();
        return courseVersion.parse(json);
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/registry/versions?id=${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input), cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return courseVersion.parse(json);
      }
    },
    async deleteVersion(id) {
      if (typeof window === 'undefined') {
        await serverFetch(`/api/registry/versions?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/registry/versions?id=${encodeURIComponent(id)}`, { method: 'DELETE', cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      return { ok: true } as const;
    }
  };
}

function buildTestGateway(): RegistryGateway {
  return {
    async listCourses(params) {
      const page = params.page ?? 1;
      const page_size = params.page_size ?? 20;
      const totalCount = 137;
      const start = (page - 1) * page_size;
      const rows = Array.from({ length: page_size }).map((_, i) => ({
        id: `ext-${start + i + 1}`,
        title: `External Course ${start + i + 1}`,
        kind: (start + i) % 2 ? 'v2' : 'v1',
        version: `1.${(start + i) % 10}.0`,
        status: ((start + i) % 3 === 0 ? 'draft' : ((start + i) % 3 === 1 ? 'approved' : 'disabled')) as any,
        vendor_id: null,
        description: null,
        launch_url: 'https://provider.example/launch'
      }));
      return { rows: rows as any, totalCount };
    },
    async getCourse(id) { return { id, title: `External Course ${id}`, kind: 'v2', version: '1.0.0', status: 'approved', vendor_id: null, description: null, launch_url: 'https://provider.example/launch' } as any; },
    async createCourse(input) { return { id: 'ext-new', ...input } as any; },
    async updateCourse(id, input) { return { id, ...input } as any; },
    async deleteCourse(id) { return { ok: true } as const; },
    async listVersions(external_course_id) { return Array.from({ length: 3 }).map((_, i) => ({ id: `ver-${i + 1}`, external_course_id, version: `1.${i}.0`, status: 'approved', launch_url: 'https://provider.example/launch' })); },
    async createVersion(input) { return { id: 'ver-new', ...input } as any; },
    async updateVersion(id, input) { return { id, ...input } as any; },
    async deleteVersion(id) { return { ok: true } as const; }
  } as RegistryGateway;
}

export function createHttpGateway(): RegistryGateway { return buildHttpGateway(); }
export function createTestGateway(): RegistryGateway { return buildTestGateway(); }
export function createRegistryGateway(): RegistryGateway { return isTestMode() ? createTestGateway() : createHttpGateway(); }


