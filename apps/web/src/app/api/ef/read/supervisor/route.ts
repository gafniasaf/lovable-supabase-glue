import { withRouteTiming } from '@/server/withRouteTiming';
import { createApiHandler } from '@/server/apiHandler';
import { jsonDto } from '@/lib/jsonDto';
import { getSupervisorQueue } from '@/server/services/expertfolio.read';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { supervisorQueueDto } from '@education/shared';

const schema = z.object({ supervisorId: z.string().min(1) }).strict();

export const runtime = 'nodejs';
export const POST = withRouteTiming(createApiHandler({
  schema,
  handler: async (input, ctx) => {
    const requestId = ctx.requestId;
    try {
      const data = await getSupervisorQueue(ctx.req, input!.supervisorId);
      return jsonDto(data as any, supervisorQueueDto as any, { requestId, status: 200 });
    } catch (e: any) {
      return NextResponse.json({ error: { code: 'INTERNAL', message: e?.message || 'ef_read_error' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    }
  }
}));


