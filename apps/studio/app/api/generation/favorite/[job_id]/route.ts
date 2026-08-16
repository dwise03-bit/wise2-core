/**
 * PATCH /api/generation/favorite/[job_id]
 * Toggle favorite status of a generation
 *
 * Request body:
 * - favorite: boolean - Whether to favorite or unfavorite
 *
 * Response: FavoriteToggleResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  validateRequest,
  successResponse,
  ApiException,
  ValidationSchema,
} from '@/lib/api-middleware';
import {
  FavoriteToggleRequest,
  FavoriteToggleResponse,
  UserContext,
} from '@/types/api';
import { generationDb } from '@/lib/generation-db';

// Validation schema
const favoriteSchema: ValidationSchema = {
  favorite: {
    type: 'boolean',
    required: true,
  },
};

/**
 * Toggle favorite status
 * Requires authentication
 */
async function toggleFavorite(
  request: NextRequest,
  user: UserContext | null,
  params?: Record<string, string>
): Promise<NextResponse> {
  // Require authentication
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const jobId = params?.job_id;
  if (!jobId) {
    throw new ApiException(400, 'INVALID_REQUEST', 'Missing job_id parameter');
  }

  // Get generation record
  const generation = generationDb.getById(jobId);
  if (!generation) {
    throw new ApiException(404, 'NOT_FOUND', 'Generation not found');
  }

  // Verify ownership
  if (generation.userId !== user.id) {
    throw new ApiException(403, 'FORBIDDEN', 'Access denied');
  }

  // Parse and validate request body
  const body = (await request.json()) as Record<string, unknown>;
  const { valid, errors } = validateRequest(body, favoriteSchema);
  if (!valid) {
    throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid request data', {
      errors,
    });
  }

  // Update favorite status
  const updated = generationDb.toggleFavorite(jobId, body.favorit as any as boolean);
  if (!updated) {
    throw new ApiException(500, 'UPDATE_FAILED', 'Failed to update favorite status');
  }

  const response: FavoriteToggleResponse = {
    jobId,
    favorite: body.favorit as any as boolean,
  };

  return successResponse(response);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  return withMiddleware(toggleFavorite)(request, { params });
}

/**
 * Handle preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
