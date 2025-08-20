import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";
import { assignment, assignmentCreateRequest, assignmentUpdateRequest } from "@education/shared";

export type AssignmentsGateway = {
  listByCourse(courseId: string): Promise<z.infer<typeof assignment>[]>;
  create(input: z.infer<typeof assignmentCreateRequest>): Promise<z.infer<typeof assignment>>;
  update(id: string, data: z.infer<typeof assignmentUpdateRequest>): Promise<z.infer<typeof assignment>>;
  delete(id: string): Promise<{ ok: true }>;
};

function buildHttpGateway(): AssignmentsGateway {
  return {
    async listByCourse(courseId) {
      if (typeof window === 'undefined') {
        return fetchJson<z.infer<typeof assignment>[]>(`/api/assignments?course_id=${encodeURIComponent(courseId)}`, z.array(assignment));
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/assignments?course_id=${encodeURIComponent(courseId)}`, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return z.array(assignment).parse(json);
      }
    },
    async create(input) {
      if (typeof window === 'undefined') {
        return fetchJson<z.infer<typeof assignment>>(`/api/assignments`, assignment, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input)
        });
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/assignments`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input), cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return assignment.parse(json);
      }
    },
    async update(id, data) {
      if (typeof window === 'undefined') {
        return fetchJson<z.infer<typeof assignment>>(`/api/assignments?id=${encodeURIComponent(id)}`, assignment, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(data)
        });
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/assignments?id=${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data), cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return assignment.parse(json);
      }
    },
    async delete(id) {
      if (typeof window === 'undefined') {
        await fetchJson(`/api/assignments?id=${encodeURIComponent(id)}`, z.object({ ok: z.boolean() }), { method: "DELETE" });
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/assignments?id=${encodeURIComponent(id)}`, { method: 'DELETE', cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      return { ok: true } as const;
    }
  };
}

function buildTestGateway(): AssignmentsGateway {
  return buildHttpGateway();
}

export function createHttpGateway(): AssignmentsGateway {
  return buildHttpGateway();
}

export function createTestGateway(): AssignmentsGateway {
  return buildTestGateway();
}

export function createAssignmentsGateway(): AssignmentsGateway {
  return isTestMode() ? createTestGateway() : createHttpGateway();
}


