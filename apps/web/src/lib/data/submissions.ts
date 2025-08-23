import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";
import { submission, submissionCreateRequest, submissionGradeRequest } from "@education/shared";

export type SubmissionsGateway = {
  listByAssignment(assignmentId: string): Promise<z.infer<typeof submission>[]>;
  create(input: z.infer<typeof submissionCreateRequest>): Promise<z.infer<typeof submission>>;
  grade(id: string, data: z.infer<typeof submissionGradeRequest>): Promise<z.infer<typeof submission>>;
};

function buildHttpGateway(): SubmissionsGateway {
  return {
    async listByAssignment(assignmentId) {
      if (typeof window === 'undefined') {
        return fetchJson<z.infer<typeof submission>[]>(`/api/submissions?assignment_id=${encodeURIComponent(assignmentId)}`, z.array(submission));
      } else {
        const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
        const res = await fetch(`${origin}/api/submissions?assignment_id=${encodeURIComponent(assignmentId)}`, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return z.array(submission).parse(json);
      }
    },
    async create(input) {
      if (typeof window === 'undefined') {
        return fetchJson<z.infer<typeof submission>>(`/api/submissions`, submission, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input)
        });
      } else {
        const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
        const res = await fetch(`${origin}/api/submissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input), cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return submission.parse(json);
      }
    },
    async grade(id, data) {
      if (typeof window === 'undefined') {
        return fetchJson<z.infer<typeof submission>>(`/api/submissions?id=${encodeURIComponent(id)}`, submission, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(data)
        });
      } else {
        const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
        const res = await fetch(`${origin}/api/submissions?id=${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data), cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return submission.parse(json);
      }
    }
  };
}

function buildTestGateway(): SubmissionsGateway {
  return buildHttpGateway();
}

export function createHttpGateway(): SubmissionsGateway {
  return buildHttpGateway();
}

export function createTestGateway(): SubmissionsGateway {
  return buildTestGateway();
}

export function createSubmissionsGateway(): SubmissionsGateway {
  return isTestMode() ? createTestGateway() : createHttpGateway();
}


