// @ts-nocheck
import { z } from "zod";

/**
 * Parse and validate URL search params using a Zod schema.
 * - Accepts Request or raw URL string
 * - Only considers the first value per key
 * - Use `.strict()` on schemas to forbid unknown keys
 */
export function parseQuery<T>(reqOrUrl: Request | { url: string } | string, schema: z.ZodType<T>): T {
  const url = typeof reqOrUrl === 'string' ? reqOrUrl : ('url' in reqOrUrl ? reqOrUrl.url : (reqOrUrl as Request).url);
  const sp = new URL(url).searchParams;
  const raw: Record<string, string> = {};
  for (const [k, v] of sp) raw[k] = v;
  return schema.parse(raw);
}


