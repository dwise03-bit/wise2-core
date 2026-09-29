/**
 * GET /api/generation/status/[job_id]
 * Get current status of a generation job
 *
 * Response: GenerationStatusResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  successResponse,
  ApiException,
} from '@/lib/api-middleware';
import {
  GenerationStatusResponse,
  UserContext,
} from '@/types/api';
import { generationDb } from '@/lib/generation-db';
import { jobQueue } from '@/lib/job-queue';

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

  // Get queue job for ETA calculation
  const queueJob = jobQueue.getJob(jobId);
  const queueStatus = jobQueue.getStatus();

  // Calculate ETA
  let eta: number | undefined;
  if (generation.status === 'queued') {
    // Estimate based on queue position and average processing time
    // Average generation ~15 seconds + queue wait
    const queuePosition = queueStatus.queued;
    const avgProcessingTime = 15;
    eta = queuePosition * avgProcessingTime;
  } else if (generation.status === 'generating') {
    // Estimate based on duration
    eta = Math.ceil((generation.duration || 30) * 0.3); // Estimate 0.3x real-time
  }

  const response: GenerationStatusResponse = {
    jobId,
    status: generation.status,
    progress: generation.progress,
    eta,
    error: generation.error,
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
