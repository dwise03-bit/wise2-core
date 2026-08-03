/**
 * GET /api/obs/scenes
 * List all OBS scenes
 *
 * Response: ObsScene[]
 *
 * POST /api/obs/scenes
 * Create a new OBS scene
 *
 * Request body:
 * - name: string (required) - Scene name
 *
 * Response: ObsScene
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  successResponse,
  validateRequest,
  createdResponse,
  ApiException,
  ValidationSchema,
} from '@/lib/api-middleware';
import {
  ObsScene,
  ObsSceneCreateRequest,
} from '@/types/api';
import { UserContext } from '@/types/api';

// Validation schema for scene creation
const sceneCreateSchema: ValidationSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 255,
  },
};

/**
 * List all scenes
 * Requires authentication
 */
async function listScenes(
  request: NextRequest,
  user: UserContext | null
): Promise<NextResponse> {
  // Require authentication
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  // TODO: Fetch scenes from database or OBS
  // const scenes = await db.obsScenes.findMany({
  //   where: { userId: user.id },
  //   orderBy: { order: 'asc' }
  // });

  // Mock data
  const scenes: ObsScene[] = [
    {
      id: 'scene_001',
      name: 'Main Stream',
      order: 1,
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      updatedAt: new Date(Date.now() - 604800000).toISOString(),
    },
    {
      id: 'scene_002',
      name: 'Outro',
      order: 2,
      createdAt: new Date(Date.now() - 518400000).toISOString(),
      updatedAt: new Date(Date.now() - 518400000).toISOString(),
    },
    {
      id: 'scene_003',
      name: 'Intermission',
      order: 3,
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      updatedAt: new Date(Date.now() - 432000000).toISOString(),
    },
  ];

  return successResponse(scenes);
}

/**
 * Create a new scene
 * Requires authentication
 */
async function createScene(
  request: NextRequest,
  user: UserContext | null
): Promise<NextResponse> {
  // Require authentication
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  // Parse request body
  const body = (await request.json()) as Record<string, unknown>;

  // Validate request
  const { valid, errors } = validateRequest(body, sceneCreateSchema);
  if (!valid) {
    throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid request data', {
      errors,
    });
  }

  const payload: ObsSceneCreateRequest = {
    name: body.name as any,
  };

  // TODO: Create scene in database or OBS
  // const scene = await db.obsScenes.create({
  //   data: {
  //     userId: user.id,
  //     name: payload.name,
  //     order: (await db.obsScenes.count({ where: { userId: user.id } })) + 1
  //   }
  // });

  // Mock response
  const scene: ObsScene = {
    id: `scene_${Date.now()}`,
    name: payload.name,
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return createdResponse(scene);
}

/**
 * Handle request routing
 */
async function handler(
  request: NextRequest,
  user: UserContext | null
): Promise<NextResponse> {
  if (request.method === 'GET') {
    return listScenes(request, user);
  } else if (request.method === 'POST') {
    return createScene(request, user);
  }

  throw new ApiException(405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
}

export async function GET(request: NextRequest, context: any = {}) { const { params = {} } = context; return withMiddleware(listScenes)(request, { params: params as Record<string, string> });
}

export async function POST(request: NextRequest, context: any = {}) { const { params = {} } = context; return withMiddleware(createScene)(request, { params: params as Record<string, string> });
}

/**
 * Handle preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
