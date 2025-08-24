import { NextRequest, NextResponse } from 'next/server';
import { withRouteTiming } from '@/server/withRouteTiming';
import { isExpertFolioEnabled } from '@/lib/features';
import { isTestMode } from '@/lib/testMode';
import { getCurrentUserInRoute } from '@/lib/supabaseServer';
import { createApiHandler } from '@/server/apiHandler';
import { assessmentCreateRequest, assessmentResponse } from '@education/shared';
import { createAssessment } from '@/server/adapters/expertfolio.inproc';
import { jsonDto } from '@/lib/jsonDto';

export const runtime = 'nodejs';

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!isTestMode()) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Not found' }, requestId }, { status: 404, headers: { 'x-request-id': requestId } });
  const out = { ef: isExpertFolioEnabled(), testMode: true } as any;
  return NextResponse.json(out, { status: 200, headers: { 'x-request-id': requestId } });
});

export const POST = withRouteTiming(createApiHandler({
  schema: assessmentCreateRequest,
  handler: async (input, ctx) => {
    const requestId = ctx.requestId;
    if (!isTestMode()) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'test mode only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
    const user = await getCurrentUserInRoute(ctx.req as any);
    if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
    try {
      const data = await createAssessment({ programId: input!.programId, epaId: input!.epaId, userId: user.id });
      const dto = assessmentResponse.parse(data);
      return jsonDto(dto as any, assessmentResponse as any, { requestId, status: 201 });
    } catch (e: any) {
      return NextResponse.json({ error: { code: 'INTERNAL', message: e?.message || 'diag_error' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    }
  }
}));


