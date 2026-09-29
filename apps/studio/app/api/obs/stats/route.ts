/**
 * GET /api/obs/stats
 * Get real-time stream statistics
 *
 * Response: ObsStreamStats
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  successResponse,
  ApiException,
} from '@/lib/api-middleware';
import { ObsStreamStats } from '@/types/api';
import { UserContext } from '@/types/api';

/**
 * Get stream statistics
 * Requires authentication
 */
async function getStreamStats(
  request: NextRequest,
  user: UserContext | null
): Promise<NextResponse> {
  // Require authentication
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  // TODO: Get stats from OBS
  // const stats = await obsClient.getStreamStats();

  // Mock response - active stream stats
  const response: ObsStreamStats = {
    status: 'active',
    streamId: 'stream_1721873400000',
    duration: 1847, // ~30 minutes
    bitrate: 4500, // kbps
    fps: 30,
    droppedFrames: 5,
    totalFrames: 55410,
    bandwidth: 4.8, // mbps
    bytesTransferred: 3355443200, // ~3.2 GB
    cpuUsage: 42.5, // percentage
    memoryUsage: 58.3, // percentage
    updatedAt: new Date().toISOString(),
  };

  return successResponse(response);
}

export async function GET(
  request: NextRequest,
  context: any = {}
) {
  const { params = {} } = context;
  return withMiddleware(getStreamStats)(request, { params: params as Record<string, string> });
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
