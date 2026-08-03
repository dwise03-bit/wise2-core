/**
 * POST /api/obs/stream/stop
 * Stop streaming
 *
 * Response: ObsStreamStopResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  successResponse,
  ApiException,
} from '@/lib/api-middleware';
import { ObsStreamStopResponse } from '@/types/api';
import { UserContext } from '@/types/api';

/**
 * Stop streaming
 * Requires authentication
 */
async function stopStream(
  request: NextRequest,
  user: UserContext | null
): Promise<NextResponse> {
  // Require authentication
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  // TODO: Connect to OBS and stop streaming
  // const stats = await obsClient.stopStreaming();

  // Mock response
  const response: ObsStreamStopResponse = {
    status: 'stopped',
    stoppedAt: new Date().toISOString(),
    duration: 3661, // 1 hour, 1 minute, 1 second
    bytesTransferred: 1572864000, // ~1.5 GB
  };

  return successResponse(response);
}

export async function POST(
  request: NextRequest,
  context: any = {}
) {
  const { params = {} } = context;
  return withMiddleware(stopStream)(request, { params: params as Record<string, string> });
}

/**
 * Handle preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
