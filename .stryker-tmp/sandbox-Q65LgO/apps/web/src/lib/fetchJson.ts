// @ts-nocheck
import { ZodSchema } from "zod";

export async function fetchJson<T>(schema: ZodSchema<T>, url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { ...(init?.headers || {}), 'accept': 'application/json' } });
  const text = await res.text();
  let json: unknown = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg = (json as any)?.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Invalid response: ${parsed.error.message}`);
  }
  return parsed.data;
}


