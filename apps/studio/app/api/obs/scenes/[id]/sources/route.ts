/**
 * GET /api/obs/scenes/[id]/sources
 * List all sources for a scene
 *
 * Path params:
 * - id: string - Scene ID
 *
 * Response: ObsSource[]
 *
 * POST /api/obs/scenes/[id]/sources
 * Add a source to a scene
 *
 * Path params:
 * - id: string - Scene ID
 *
 * Request body:
 * - name: string (required) - Source name
 * - type: 'video' | 'audio' | 'text' | 'image' | 'scene' | 'custom' (required)
 * - settings?: Record<string, any> - Source settings
 *
 * Response: ObsSource
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
import { ObsSource, ObsSourceCreateRequest } from '@/types/api';
import { UserContext } from '@/types/api';

// Validation schema for source creation
const sourceCreateSchema: ValidationSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 255,
  },
  type: {
    type: 'string',
    required: true,
    enum: ['video', 'audio', 'text', 'image', 'scene', 'custom'],
  },
  settings: {
    type: 'object',
    required: false,
  },
};

/**
 * List all sources for a scene
 * Requires authentication
 */
async function listSources(
  request: NextRequest,
  user: UserContext | null,
  params?: Record<string, string>
): Promise<NextResponse> {
  // Require authentication
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const sceneId = params?.id;

  // Validate scene ID
  if (!sceneId) {
    throw new ApiException(400, 'MISSING_PARAM', 'Scene ID is required');
  }

  // TODO: Fetch sources from database or OBS
  // const sources = await db.obsSources.findMany({
  //   where: { sceneId, scene: { userId: user.id } },
  //   orderBy: { order: 'asc' }
  // });

  // Mock data
  const sources: ObsSource[] = [
    {
      id: 'source_001',
      sceneId,
      name: 'Webcam',
      type: 'video',
      settings: { device: '/dev/video0' },
      enabled: true,
      order: 1,
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      updatedAt: new Date(Date.now() - 604800000).toISOString(),
    },
    {
      id: 'source_002',
      sceneId,
      name: 'Microphone',
      type: 'audio',
      settings: { device: 'default' },
      enabled: true,
      order: 2,
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      updatedAt: new Date(Date.now() - 604800000).toISOString(),
    },
    {
      id: 'source_003',
      sceneId,
      name: 'Scene Title',
      type: 'text',
      settings: { text: 'My Live Stream', fontSize: 48 },
      enabled: true,
      order: 3,
      createdAt: new Date(Date.now() - 518400000).toISOString(),
      updatedAt: new Date(Date.now() - 518400000).toISOString(),
    },
  ];

  return successResponse(sources);
}

/**
 * Add a source to a scene
 * Requires authentication
 */
async function addSource(
  request: NextRequest,
  user: UserContext | null,
  params?: Record<string, string>
): Promise<NextResponse> {
  // Require authentication
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const sceneId = params?.id;

  // Validate scene ID
  if (!sceneId) {
    throw new ApiException(400, 'MISSING_PARAM', 'Scene ID is required');
  }

  // Parse request body
  const body = (await request.json()) as Record<string, unknown>;

  // Validate request
  const { valid, errors } = validateRequest(body, sourceCreateSchema);
  if (!valid) {
    throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid request data', {
      errors,
    });
  }

  const payload: ObsSourceCreateRequest = {
    sceneId,
    name: body.name as any,
    type: body.type as any,
    settings: body.settings as any || {},
  };

  // TODO: Create source in database or OBS
  // const source = await db.obsSources.create({
  //   data: {
  //     sceneId,
  //     name: payload.name,
  //     type: payload.type,
  //     settings: payload.settings,
  //     order: (await db.obsSources.count({ where: { sceneId } })) + 1
  //   }
  // });

  // Mock response
  const source: ObsSource = {
    id: `source_${Date.now()}`,
    sceneId,
    name: payload.name,
    type: payload.type,
    settings: payload.settings,
    enabled: true,
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return createdResponse(source);
}

/**
 * Handle request routing
 */
async function handler(
  request: NextRequest,
  user: UserContext | null,
  params?: Record<string, string>
): Promise<NextResponse> {
  if (request.method === 'GET') {
    return listSources(request, user, params);
  } else if (request.method === 'POST') {
    return addSource(request, user, params);
  }

  throw new ApiException(405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  return withMiddleware(listSources)(request, { params });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  return withMiddleware(addSource)(request, { params });
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
