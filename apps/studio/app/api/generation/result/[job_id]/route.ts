/**
 * GET /api/generation/result/[job_id]
 * Get completed generation result with audio URL and metadata
 *
 * Response: GenerationResultResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  successResponse,
  ApiException,
} from '@/lib/api-middleware';
import {
  GenerationResultResponse,
  UserContext,
} from '@/types/api';
import { generationDb } from '@/lib/generation-db';

/**
 * Get generation result
 * Requires authentication
 */
async function getResult(
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

  // Check if completed
  if (generation.status !== 'completed') {
    throw new ApiException(
      400,
      'NOT_COMPLETED',
      `Generation is ${generation.status}, not completed`
    );
  }

  // Check if audio URL exists
  if (!generation.audioUrl) {
    throw new ApiException(
      500,
      'MISSING_AUDIO',
      'Audio URL not available'
    );
  }

  const response: GenerationResultResponse = {
    jobId,
    status: 'completed',
    audioUrl: generation.audioUrl,
    metadata: {
      prompt: generation.prompt,
      genre: generation.genre,
      mood: generation.mood,
      tempo: generation.tempo,
      duration: generation.duration,
      key: generation.key,
      intensity: generation.intensity,
      generationTime: generation.metadata?.generationTime || 0,
      modelVersion: generation.metadata?.modelVersion || 'unknown',
      qualityScore: generation.metadata?.qualityScore || 0,
    },
    createdAt: generation.createdAt,
    completedAt: generation.completedAt || new Date().toISOString(),
  };

  return successResponse(response);
}

export async function GET(
  request: NextRequest,
  context: any = {}
) {
  const { params = {} } = context;
  return withMiddleware(getResult)(request, { params: params as Record<string, string> });
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
