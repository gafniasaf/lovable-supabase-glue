import { withRouteTiming } from '@/server/withRouteTiming';
import { createApiHandler } from '@/server/apiHandler';
import { jsonDto } from '@/lib/jsonDto';
import { presignDownloadUrl } from '@/lib/files';
import { resolveTenantFromHostOrPrefix } from '@/lib/tenant';
import { storageKey } from '@/lib/storageKey';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const schema = z.object({ entity: z.string().min(1), id: z.string().min(1), filename: z.string().min(1) }).strict();
const responseDto = z.object({ url: z.string().min(1) }).strict();

export const runtime = 'nodejs';
export const POST = withRouteTiming(createApiHandler({
  schema,
  handler: async (input, ctx) => {
    const requestId = ctx.requestId;
    try {
      const { tenantId, product } = resolveTenantFromHostOrPrefix(ctx.req);
      const objectKey = storageKey({ tenantId, product, entity: input!.entity, id: input!.id, filename: input!.filename });
      const bucket = process.env.NEXT_PUBLIC_UPLOAD_BUCKET || 'public';
      const url = await presignDownloadUrl({ bucket, objectKey });
      const dto = responseDto.parse({ url });
      return jsonDto(dto as any, responseDto as any, { requestId, status: 200 });
    } catch (e: any) {
      return NextResponse.json({ error: { code: 'INTERNAL', message: e?.message || 'ef_download_error' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    }
  }
}));


