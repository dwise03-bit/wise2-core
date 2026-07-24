/**
 * POST /api/suno/generate
 * Submit a Suno music generation request
 *
 * Request body:
 * - prompt: string (required) - Music generation prompt
 * - style?: string - Music style/genre
 * - duration?: number - Duration in seconds
 * - temperature?: number - Creativity (0-1)
 * - tags?: string[] - Additional tags
 *
 * Response: SunoGenerationResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  validateRequest,
  createdResponse,
  ApiException,
  successResponse,
} from '@/lib/api-middleware';
import {
  SunoGenerationRequest,
  SunoGenerationResponse,
} from '@/types/api';
import { UserContext, ValidationSchema } from '@/types/api';

// Validation schema for generation request
const generationSchema: ValidationSchema = {
  prompt: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 500,
  },
  style: {
    type: 'string',
    required: false,
    maxLength: 100,
  },
  duration: {
    type: 'number',
    required: false,
    min: 10,
    max: 300,
  },
  temperature: {
    type: 'number',
    required: false,
    min: 0,
    max: 1,
  },
  tags: {
    type: 'array',
    required: false,
  },
};

/**
 * Generate new music using Suno
 * Requires authentication
 */
async function generateMusic(
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
  const { valid, errors } = validateRequest(body, generationSchema);
  if (!valid) {
    throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid request data', {
      errors,
    });
  }

  const payload: SunoGenerationRequest = {
    prompt: body.prompt,
    style: body.style,
    duration: body.duration,
    temperature: body.temperature,
    tags: body.tags,
  };

  // TODO: Call Suno API
  // const sunoResponse = await sunoClient.generate(payload);

  // Mock response for now
  const response: SunoGenerationResponse = {
    id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    prompt: payload.prompt,
    style: payload.style,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return createdResponse(response);
}

export const POST = withMiddleware(generateMusic);

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
