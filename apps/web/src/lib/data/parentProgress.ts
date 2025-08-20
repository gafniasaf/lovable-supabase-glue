import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";

export type ParentProgressGateway = {
  list(student_id: string, opts?: { course_id?: string }): Promise<{ course_id: string; completedLessons: number; totalLessons: number; percent: number }[]>;
  csv(student_id: string): Promise<string>;
};

const row = z.object({ course_id: z.string(), completedLessons: z.number(), totalLessons: z.number(), percent: z.number() });
const dto = z.object({ courses: z.array(row) });

function buildHttpGateway(): ParentProgressGateway {
  return {
    async list(student_id, opts) {
      const q = new URLSearchParams({ student_id });
      if (opts?.course_id) q.set('course_id', opts.course_id);
      const res: z.infer<typeof dto> = await fetchJson(`/api/parent/progress?${q.toString()}`, dto);
      return res.courses || [];
    },
    async csv(student_id) {
      const r = await fetch(`/api/parent/progress?student_id=${encodeURIComponent(student_id)}&format=csv`, { cache: 'no-store' });
      return await r.text();
    }
  };
}

function buildTestGateway(): ParentProgressGateway { return buildHttpGateway(); }
export function createHttpGateway(): ParentProgressGateway { return buildHttpGateway(); }
export function createTestGateway(): ParentProgressGateway { return buildTestGateway(); }
export function createParentProgressGateway(): ParentProgressGateway { return isTestMode() ? createTestGateway() : createHttpGateway(); }


