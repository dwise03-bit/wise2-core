/**
 * POST /api/obs/stream/start
 * Begin streaming
 *
 * Request body:
 * - sceneId?: string - Scene ID to start streaming with
 * - serviceUrl?: string - RTMP service URL
 * - streamKey?: string - Stream key/token
 *
 * Response: ObsStreamStartResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  createdResponse,
  validateRequest,
  ApiException,
} from '@/lib/api-middleware';
import { ObsStreamStartRequest, ObsStreamStartResponse, ValidationSchema } from '@/types/api';
import { UserContext } from '@/types/api';

// Validation schema for stream start
const streamStartSchema: ValidationSchema = {
  sceneId: {
    type: 'string',
    required: false,
    minLength: 1,
  },
  serviceUrl: {
    type: 'string',
    required: false,
    minLength: 10,
  },
  streamKey: {
    type: 'string',
    required: false,
    minLength: 1,
  },
};

/**
 * Start streaming
 * Requires authentication
 */
async function startStream(
  request: NextRequest,
  user: UserContext | null
): Promise<NextResponse> {
  // Require authentication
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  // Parse request body
  const body = await request.json();

  // Validate request
  const { valid, errors } = validateRequest(body, streamStartSchema);
  if (!valid) {
    throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid request data', {
      errors,
    });
  }

  const payload: ObsStreamStartRequest = {
    sceneId: body.sceneId,
    serviceUrl: body.serviceUrl,
    streamKey: body.streamKey,
  };

  // TODO: Connect to OBS and start streaming
  // const stream = await obsClient.startStreaming({
  //   scene: payload.sceneId,
  //   rtmpUrl: payload.serviceUrl,
  //   streamKey: payload.streamKey
  // });

  // Mock response
  const response: ObsStreamStartResponse = {
    status: 'active',
    streamId: `stream_${Date.now()}`,
    startedAt: new Date().toISOString(),
    rtmpUrl: payload.serviceUrl,
  };

  return createdResponse(response);
}

export const POST = withMiddleware(startStream);

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
