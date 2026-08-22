/**
 * GET /api/suno/status/[id]
 * Poll generation status for a specific ID
 *
 * Previously a mock returning a hard-coded "processing" response. Now reads
 * the real outcome recorded by /api/suno/generate.
 *
 * Path params:
 * - id: string - Generation ID
 *
 * Response: SunoStatusResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  successResponse,
  ApiException,
} from '@/lib/api-middleware';
import { SunoStatusResponse } from '@/types/api';
import { UserContext } from '@/types/api';
import { getGeneration } from '@/lib/suno-generation-store';

/**
 * Get generation status
 * Requires authentication
 */
async function getStatus(
  request: NextRequest,
  user: UserContext | null,
  params?: Record<string, string>
): Promise<NextResponse> {
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const id = params?.id;

  if (!id) {
    throw new ApiException(400, 'MISSING_PARAM', 'Generation ID is required');
  }

  if (!/^gen_/.test(id)) {
    throw new ApiException(400, 'INVALID_ID', 'Invalid generation ID format');
  }

  const generation = getGeneration(id);
  if (!generation) {
    throw new ApiException(404, 'NOT_FOUND', 'Generation not found');
  }

  const response: SunoStatusResponse = {
    id: generation.id,
    prompt: generation.prompt,
    style: generation.style,
    status: generation.status,
    progress: generation.progress,
    musicUrl: generation.musicUrl,
    duration: generation.duration,
    createdAt: generation.createdAt,
    updatedAt: generation.updatedAt,
    completedAt: generation.completedAt,
    errorMessage: generation.error,
  };

  return successResponse(response);
}

export async function GET(
  request: NextRequest,
  context: any = {}
) {
  const { params = {} } = context;
  return withMiddleware(getStatus)(request, { params: params as Record<string, string> });
}

/**
 * Handle preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
