import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware, requireAuth, successResponse, validateRequest, createdResponse, ApiException, ValidationSchema } from '@/lib/api-middleware';
import { UserContext } from '@/types/api';
import { getObsClient, ObsError } from '@/lib/obs-client';

const sceneCreateSchema: ValidationSchema = { name: { type: 'string', required: true, minLength: 1, maxLength: 255 } };

async function listScenes(request: NextRequest, user: UserContext | null): Promise<NextResponse> {
  if (!requireAuth(user)) throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  try {
    const obs = getObsClient();
    const [scenes, currentScene] = await Promise.all([obs.getScenes(), obs.getCurrentScene()]);
    return successResponse({ scenes, currentScene });
  } catch (error) {
    if (error instanceof ObsError) throw new ApiException(503, 'OBS_UNAVAILABLE', error.message);
    throw error;
  }
}

async function createScene(request: NextRequest, user: UserContext | null): Promise<NextResponse> {
  if (!requireAuth(user)) throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  const body = (await request.json()) as Record<string, unknown>;
  const { valid, errors } = validateRequest(body, sceneCreateSchema);
  if (!valid) throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid request data', { errors });
  try { return createdResponse(await getObsClient().createScene(String(body.name))); }
  catch (error) {
    if (error instanceof ObsError) throw new ApiException(503, 'OBS_UNAVAILABLE', error.message);
    throw error;
  }
}

export async function GET(request: NextRequest, context: any = {}) {
  const { params = {} } = context; return withMiddleware(listScenes)(request, { params: params as Record<string, string> });
}
export async function POST(request: NextRequest, context: any = {}) {
  const { params = {} } = context; return withMiddleware(createScene)(request, { params: params as Record<string, string> });
}
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }});
}
