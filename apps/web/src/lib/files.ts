import { getRouteHandlerSupabase } from "@/lib/supabaseServer";

export type PresignInput = { bucket: string; objectKey: string; contentType: string; expiresIn?: number };

/**
 * Issue a presigned URL using Supabase Storage (server role required for upload presign).
 * The caller must validate ownership/authorization before calling this helper.
 */
export async function presignUploadUrl(input: PresignInput): Promise<{ url: string; method: 'PUT'; headers: Record<string, string> }> {
  const supabase = getRouteHandlerSupabase();
  const expires = input.expiresIn ?? 600; // seconds
  const { data, error } = await (supabase as any).storage.from(input.bucket).createSignedUploadUrl(input.objectKey, expires, { contentType: input.contentType });
  if (error) throw new Error(error.message);
  return { url: (data as any).signedUrl as string, method: 'PUT', headers: { 'content-type': input.contentType } };
}

export async function presignDownloadUrl(input: { bucket: string; objectKey: string; expiresIn?: number }): Promise<string> {
  const supabase = getRouteHandlerSupabase();
  const expires = input.expiresIn ?? 300; // seconds
  const { data, error } = await (supabase as any).storage.from(input.bucket).createSignedUrl(input.objectKey, expires);
  if (error) throw new Error(error.message);
  let url = (data as any).signedUrl as string;
  // In test env, storage mock may return a relative path; normalize to absolute URL
  try {
    const isAbsolute = /^https?:\/\//i.test(url);
    if (!isAbsolute) {
      let base = `http://localhost`;
      try { if (typeof window !== 'undefined' && window.location?.origin) base = window.location.origin; }
      catch {}
      if (!base && process.env.NEXT_PUBLIC_BASE_URL) base = String(process.env.NEXT_PUBLIC_BASE_URL);
      url = `${base}${url.startsWith('/') ? '' : '/'}${url}`;
    }
  } catch {}
  return url;
}

/** Convenience helper to upload a Blob/ArrayBuffer to a presigned URL. */
export async function uploadBinaryToUrl(url: string, body: ArrayBuffer | Blob, options?: { method?: string; headers?: Record<string, string> }) {
  const method = options?.method || 'PUT';
  const headers = options?.headers || {};
  const res = await fetch(url, { method, body: body as any, headers });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return { ok: true as const };
}


