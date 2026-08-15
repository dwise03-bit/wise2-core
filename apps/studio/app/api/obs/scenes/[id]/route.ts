/**
 * PUT /api/obs/scenes/[id]
 * Update an OBS scene
 *
 * Path params:
 * - id: string - Scene ID
 *
 * Request body:
 * - name?: string - New scene name
 * - order?: number - New scene order
 *
 * Response: ObsScene
 *
 * DELETE /api/obs/scenes/[id]
 * Delete an OBS scene
 *
 * Path params:
 * - id: string - Scene ID
 *
 * Response: { success: true, id: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  successResponse,
  validateRequest,
  ApiException,
  ValidationSchema,
} from '@/lib/api-middleware';
import { ObsScene, ObsSceneUpdateRequest } from '@/types/api';
import { UserContext } from '@/types/api';

// Validation schema for scene update
const sceneUpdateSchema: ValidationSchema = {
  name: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 255,
  },
  order: {
    type: 'number',
    required: false,
    min: 1,
  },
};

/**
 * Update a scene
 * Requires authentication
 */
async function updateScene(
  request: NextRequest,
  user: UserContext | null,
  params?: Record<string, string>
): Promise<NextResponse> {
  // Require authentication
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const id = params?.id;

  // Validate ID
  if (!id) {
    throw new ApiException(400, 'MISSING_PARAM', 'Scene ID is required');
  }

  // Parse request body
  const body = (await request.json()) as Record<string, unknown>;

  // Validate request (all fields optional for update)
  const { valid, errors } = validateRequest(body, sceneUpdateSchema);
  if (!valid) {
    throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid request data', {
      errors,
    });
  }

  const payload: ObsSceneUpdateRequest = {
    name: body.name as any,
    order: body.order as any,
  };

  // TODO: Update scene in database or OBS
  // const scene = await db.obsScenes.update({
  //   where: { id, userId: user.id },
  //   data: {
  //     ...(payload.name && { name: payload.name }),
  //     ...(payload.order && { order: payload.order })
  //   }
  // });

  // Mock response
  const scene: ObsScene = {
    id,
    name: payload.name || 'Updated Scene',
    order: payload.order || 1,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return successResponse(scene);
}

/**
 * Delete a scene
 * Requires authentication
 */
async function deleteScene(
  request: NextRequest,
  user: UserContext | null,
  params?: Record<string, string>
): Promise<NextResponse> {
  // Require authentication
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const id = params?.id;

  // Validate ID
  if (!id) {
    throw new ApiException(400, 'MISSING_PARAM', 'Scene ID is required');
  }

  // TODO: Delete scene from database or OBS
  // await db.obsScenes.delete({
  //   where: { id, userId: user.id }
  // });

  return successResponse({ id, deleted: true });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  return withMiddleware(updateScene)(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  return withMiddleware(deleteScene)(request, { params });
}

/**
 * Handle preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
