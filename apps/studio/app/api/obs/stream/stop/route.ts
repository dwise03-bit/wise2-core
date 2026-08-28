import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware, requireAuth, successResponse, ApiException } from '@/lib/api-middleware';
import { UserContext } from '@/types/api';
import { getObsClient, ObsError } from '@/lib/obs-client';

async function stopStream(request: NextRequest, user: UserContext | null): Promise<NextResponse> {
  if (!requireAuth(user)) throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  try {
    const obs = getObsClient();
    const before = await obs.getStats();
    await obs.stopStreaming();
    const after = await obs.getStats();
    if (after.status === 'active') throw new ApiException(502, 'OBS_STILL_ACTIVE', 'OBS did not confirm stream shutdown');
    return successResponse({
      status: 'stopped',
      stoppedAt: new Date().toISOString(),
      duration: before.duration,
      bytesTransferred: before.bytesTransferred,
    });
  } catch (error) {
    if (error instanceof ApiException) throw error;
    if (error instanceof ObsError) throw new ApiException(503, 'OBS_UNAVAILABLE', error.message);
    throw error;
  }
}

export async function POST(request: NextRequest, context: any = {}) {
  const { params = {} } = context;
  return withMiddleware(stopStream)(request, { params: params as Record<string, string> });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }});
}
