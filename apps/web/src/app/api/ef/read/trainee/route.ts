import { withRouteTiming } from '@/server/withRouteTiming';
import { createApiHandler } from '@/server/apiHandler';
import { jsonDto } from '@/lib/jsonDto';
import { getTraineeEpaProgress } from '@/server/services/expertfolio.read';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { traineeEpaProgressDto } from '@education/shared';

const schema = z.object({ traineeId: z.string().min(1), programId: z.string().min(1) }).strict();

export const runtime = 'nodejs';
export const POST = withRouteTiming(createApiHandler({
  schema,
  handler: async (input, ctx) => {
    const requestId = ctx.requestId;
    try {
      const data = await getTraineeEpaProgress(ctx.req, input!.traineeId, input!.programId);
      return jsonDto(data as any, traineeEpaProgressDto as any, { requestId, status: 200 });
    } catch (e: any) {
      return NextResponse.json({ error: { code: 'INTERNAL', message: e?.message || 'ef_read_error' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    }
  }
}));


