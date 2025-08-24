import { withRouteTiming } from '@/server/withRouteTiming';
import { createApiHandler } from '@/server/apiHandler';
import { jsonDto } from '@/lib/jsonDto';
import { getProgramOverview } from '@/server/services/expertfolio.read';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { programOverviewDto } from '@education/shared';

const schema = z.object({ programId: z.string().min(1) }).strict();

export const runtime = 'nodejs';
export const POST = withRouteTiming(createApiHandler({
  schema,
  handler: async (input, ctx) => {
    const requestId = ctx.requestId;
    try {
      const data = await getProgramOverview(ctx.req, input!.programId);
      return jsonDto(data as any, programOverviewDto as any, { requestId, status: 200 });
    } catch (e: any) {
      return NextResponse.json({ error: { code: 'INTERNAL', message: e?.message || 'ef_read_error' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    }
  }
}));


