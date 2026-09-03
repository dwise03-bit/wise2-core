import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware, requireAuth, successResponse, ApiException } from '@/lib/api-middleware';
import { UserContext } from '@/types/api';
import { getObsClient, ObsError } from '@/lib/obs-client';

async function currentScene(request: NextRequest, user: UserContext | null): Promise<NextResponse> {
  if (!requireAuth(user)) throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  try {
    const obs = getObsClient();
    if (request.method === 'PUT') {
      const body = await request.json();
      if (!body?.sceneName || typeof body.sceneName !== 'string') throw new ApiException(400, 'VALIDATION_ERROR', 'sceneName is required');
      await obs.setScene(body.sceneName);
    }
    return successResponse({ sceneName: await obs.getCurrentScene() });
  } catch (error) {
    if (error instanceof ApiException) throw error;
    if (error instanceof ObsError) throw new ApiException(503, 'OBS_UNAVAILABLE', error.message);
    throw error;
  }
}

export async function GET(request: NextRequest, context: any = {}) {
  const { params = {} } = context; return withMiddleware(currentScene)(request, { params: params as Record<string, string> });
}
export async function PUT(request: NextRequest, context: any = {}) {
  const { params = {} } = context; return withMiddleware(currentScene)(request, { params: params as Record<string, string> });
}
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }});
}
