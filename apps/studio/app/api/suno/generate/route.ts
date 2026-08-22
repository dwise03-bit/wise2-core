/**
 * POST /api/suno/generate
 * Submit a music generation request
 *
 * Previously a mock ("TODO: Call Suno API"). Now calls the real WISE²
 * MusicGen service (apps/musicgen-service) via lib/musicgen-client.
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
  ValidationSchema,
} from '@/lib/api-middleware';
import {
  SunoGenerationRequest,
  SunoGenerationResponse,
} from '@/types/api';
import { UserContext } from '@/types/api';
import { generateMusic, MusicGenServiceError } from '@/lib/musicgen-client';
import { createGeneration } from '@/lib/suno-generation-store';

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
 * Generate new music via the WISE² MusicGen service.
 * Requires authentication.
 */
async function generateMusicHandler(
  request: NextRequest,
  user: UserContext | null
): Promise<NextResponse> {
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const body = (await request.json()) as Record<string, unknown>;

  const { valid, errors } = validateRequest(body, generationSchema);
  if (!valid) {
    throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid request data', {
      errors,
    });
  }

  const payload: SunoGenerationRequest = {
    prompt: body.prompt as any,
    style: body.style as any,
    duration: body.duration as any,
    temperature: body.temperature as any,
    tags: body.tags as any,
  };

  const id = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  createGeneration({
    id,
    prompt: payload.prompt,
    style: payload.style,
    status: 'processing',
    progress: 0,
    createdAt: now,
    updatedAt: now,
  });

  // MusicGen generates synchronously, so by the time this handler returns
  // the audio already exists (or generation has genuinely failed).
  let finalStatus: SunoGenerationResponse['status'] = 'processing';
  let errorMessage: string | undefined;

  try {
    const result = await generateMusic({
      prompt: payload.style ? `${payload.style}: ${payload.prompt}` : payload.prompt,
      duration: payload.duration,
      temperature: payload.temperature,
    });

    finalStatus = 'completed';
    createGeneration({
      id,
      musicgenId: result.generationId,
      prompt: payload.prompt,
      style: payload.style,
      status: 'completed',
      progress: 100,
      musicUrl: `/api/suno/audio/${result.generationId}`,
      duration: result.duration,
      createdAt: now,
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
  } catch (err) {
    finalStatus = 'failed';
    errorMessage =
      err instanceof MusicGenServiceError ? err.message : 'Music generation failed unexpectedly';
    createGeneration({
      id,
      prompt: payload.prompt,
      style: payload.style,
      status: 'failed',
      progress: 0,
      error: errorMessage,
      createdAt: now,
      updatedAt: new Date().toISOString(),
    });
  }

  // Generation already finished (MusicGen is synchronous) — report the real
  // outcome rather than a stale "processing" placeholder.
  const response: SunoGenerationResponse = {
    id,
    prompt: payload.prompt,
    style: payload.style,
    status: finalStatus,
    createdAt: now,
    updatedAt: new Date().toISOString(),
    errorMessage,
  };

  return createdResponse(response);
}

export async function POST(request: NextRequest, context: any = {}) { const { params = {} } = context; return withMiddleware(generateMusicHandler)(request, { params: params as Record<string, string> });
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
