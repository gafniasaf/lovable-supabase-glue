import { withRouteTiming } from '@/server/withRouteTiming';
import { createApiHandler } from '@/server/apiHandler';
import { jsonDto } from '@/lib/jsonDto';
import { getAllowedUploadMime } from '@/lib/mime';
import { presignUploadUrl } from '@/lib/files';
import { resolveTenantFromHostOrPrefix } from '@/lib/tenant';
import { storageKey } from '@/lib/storageKey';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const schema = z.object({ entity: z.string().min(1), id: z.string().min(1), filename: z.string().min(1), contentType: z.string().min(1) }).strict();
const responseDto = z.object({ url: z.string().min(1), method: z.literal('PUT'), headers: z.record(z.string(), z.string()) }).strict();

export const runtime = 'nodejs';
export const POST = withRouteTiming(createApiHandler({
  schema,
  handler: async (input, ctx) => {
    const requestId = ctx.requestId;
    try {
      const allowed = getAllowedUploadMime();
      if (!allowed.includes(input!.contentType)) {
        return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'mime_not_allowed' }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
      }
      const { tenantId, product } = resolveTenantFromHostOrPrefix(ctx.req);
      const objectKey = storageKey({ tenantId, product, entity: input!.entity, id: input!.id, filename: input!.filename });
      const bucket = process.env.NEXT_PUBLIC_UPLOAD_BUCKET || 'public';
      const presigned = await presignUploadUrl({ bucket, objectKey, contentType: input!.contentType });
      const dto = responseDto.parse(presigned as any);
      return jsonDto(dto as any, responseDto as any, { requestId, status: 200 });
    } catch (e: any) {
      return NextResponse.json({ error: { code: 'INTERNAL', message: e?.message || 'ef_upload_error' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    }
  }
}));


