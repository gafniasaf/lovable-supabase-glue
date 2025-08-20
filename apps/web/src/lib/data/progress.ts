import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";

export type ProgressGateway = {
  getLessonCompletionMap(courseId: string): Promise<Record<string, true>>;
};

const progressMapSchema = z.record(z.boolean());

function buildHttpGateway(): ProgressGateway {
  return {
    async getLessonCompletionMap(courseId: string) {
      // Student progress map endpoint
      const map = await fetchJson(`/api/progress?course_id=${encodeURIComponent(courseId)}`, z.any());
      // Normalize to { [lessonId]: true }
      const obj: Record<string, true> = {};
      if (map && typeof map === 'object') {
        for (const [k, v] of Object.entries(map as any)) if (v) obj[k] = true;
      }
      return obj;
    }
  };
}

function buildTestGateway(): ProgressGateway { return buildHttpGateway(); }
export function createHttpGateway(): ProgressGateway { return buildHttpGateway(); }
export function createTestGateway(): ProgressGateway { return buildTestGateway(); }
export function createProgressGateway(): ProgressGateway { return isTestMode() ? createTestGateway() : createHttpGateway(); }


