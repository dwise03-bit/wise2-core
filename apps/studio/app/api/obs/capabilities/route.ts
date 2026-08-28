import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware, requireAuth, successResponse, ApiException } from '@/lib/api-middleware';
import { UserContext } from '@/types/api';
import { getObsClient } from '@/lib/obs-client';

async function capabilities(request: NextRequest, user: UserContext | null): Promise<NextResponse> {
  if (!requireAuth(user)) throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  try {
    const obs = getObsClient();
    await obs.connect();
    return successResponse({
      authoritative: true,
      capabilities: ['streamStatus', 'streamStart', 'streamEnd', 'sceneRead', 'sceneSwitch'],
      preview: false,
      audioMeters: false,
      realtime: false,
    });
  } catch {
    return successResponse({
      authoritative: false,
      capabilities: [],
      preview: false,
      audioMeters: false,
      realtime: false,
    });
  }
}

export async function GET(request: NextRequest, context: any = {}) {
  const { params = {} } = context;
  return withMiddleware(capabilities)(request, { params: params as Record<string, string> });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }});
}
