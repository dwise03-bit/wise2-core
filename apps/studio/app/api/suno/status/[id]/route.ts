/**
 * GET /api/suno/status/[id]
 * Poll generation status for a specific ID
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

/**
 * Get generation status
 * Requires authentication
 */
async function getStatus(
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
    throw new ApiException(400, 'MISSING_PARAM', 'Generation ID is required');
  }

  if (!/^gen_/.test(id)) {
    throw new ApiException(400, 'INVALID_ID', 'Invalid generation ID format');
  }

  // TODO: Fetch from database or Suno API
  // const generation = await db.generations.findUnique({
  //   where: { id, userId: user.id }
  // });

  // Mock response
  const response: SunoStatusResponse = {
    id,
    prompt: 'Uplifting electronic dance music with synth lead',
    style: 'EDM',
    status: 'processing',
    progress: 45,
    createdAt: new Date(Date.now() - 60000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return successResponse(response);
}

export const GET = withMiddleware(getStatus);

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
