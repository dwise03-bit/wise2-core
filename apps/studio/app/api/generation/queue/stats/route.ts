/**
 * GET /api/generation/queue/stats
 * Get generation queue statistics
 * Admin/monitoring endpoint
 *
 * Response: Queue statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  successResponse,
  ApiException,
} from '@/lib/api-middleware';
import { UserContext } from '@/types/api';
import { getQueueStats } from '@/lib/job-queue';

/**
 * Get queue statistics
 * Requires authentication (any authenticated user can access)
 */
async function getStats(
  request: NextRequest,
  user: UserContext | null
): Promise<NextResponse> {
  // Require authentication
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  // Get queue stats
  const stats = getQueueStats();

  const response = {
    queue: {
      queued: stats.totalQueued,
      processing: stats.totalProcessing,
      capacity: stats.totalQueued + stats.totalProcessing,
    },
    stats: {
      averageWaitTime: `${Math.round(stats.averageWaitTime / 1000)}s`,
      totalCompleted: stats.totalCompleted,
      totalFailed: stats.totalFailed,
      successRate: stats.totalCompleted + stats.totalFailed > 0
        ? `${Math.round((stats.totalCompleted / (stats.totalCompleted + stats.totalFailed)) * 100)}%`
        : 'N/A',
    },
    timestamp: new Date().toISOString(),
  };

  return successResponse(response);
}

export async function GET(
  request: NextRequest,
  context: any = {}
) {
  const { params = {} } = context;
  return withMiddleware(getStats)(request, { params: params as Record<string, string> });
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
