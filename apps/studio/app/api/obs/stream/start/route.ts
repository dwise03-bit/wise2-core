import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware, requireAuth, createdResponse, validateRequest, ApiException, ValidationSchema } from '@/lib/api-middleware';
import { UserContext } from '@/types/api';
import { getObsClient, ObsError } from '@/lib/obs-client';

const streamStartSchema: ValidationSchema = {
  sceneId: { type: 'string', required: false, minLength: 1 },
  serviceUrl: { type: 'string', required: false, minLength: 10 },
  streamKey: { type: 'string', required: false, minLength: 1 },
};

async function startStream(request: NextRequest, user: UserContext | null): Promise<NextResponse> {
  if (!requireAuth(user)) throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const { valid, errors } = validateRequest(body, streamStartSchema);
  if (!valid) throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid request data', { errors });

  try {
    const obs = getObsClient();
    if (body.sceneId) await obs.setScene(String(body.sceneId));
    await obs.startStreaming({
      serviceUrl: body.serviceUrl as string | undefined,
      streamKey: body.streamKey as string | undefined,
    });
    const stats = await obs.getStats();
    if (stats.status !== 'active') throw new ApiException(502, 'OBS_NOT_ACTIVE', 'OBS did not confirm an active stream');
    return createdResponse({ status: 'active', streamId: stats.streamId, startedAt: new Date().toISOString() });
  } catch (error) {
    if (error instanceof ApiException) throw error;
    if (error instanceof ObsError) throw new ApiException(503, 'OBS_UNAVAILABLE', error.message);
    throw error;
  }
}

export async function POST(request: NextRequest, context: any = {}) {
  const { params = {} } = context;
  return withMiddleware(startStream)(request, { params: params as Record<string, string> });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }});
}
