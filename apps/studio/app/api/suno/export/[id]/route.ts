/**
 * GET /api/suno/export/[id]
 * Export generated music in specified format
 *
 * Path params:
 * - id: string - Generation ID
 *
 * Query params:
 * - format?: 'mp3' | 'wav' | 'flac' - Export format (default: mp3)
 * - bitrate?: number - Bitrate in kbps (default: 192 for mp3, 16bit for wav)
 *
 * Response: SunoExportResponse with download URL
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  successResponse,
  validateRequest,
  ApiException,
  ValidationSchema,
} from '@/lib/api-middleware';
import { SunoExportResponse } from '@/types/api';
import { UserContext } from '@/types/api';
import { getGeneration } from '@/lib/suno-generation-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schema for export request
const exportSchema: ValidationSchema = {
  format: {
    type: 'string',
    required: false,
    enum: ['mp3', 'wav', 'flac'],
  },
  bitrate: {
    type: 'number',
    required: false,
    min: 64,
    max: 320,
  },
};

/**
 * Export music in specified format
 * Requires authentication
 */
async function exportMusic(
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

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const queryData = {
    format: searchParams.get('format') || 'wav', // only format the MusicGen service actually produces
    bitrate: searchParams.get('bitrate')
      ? parseInt(searchParams.get('bitrate')!)
      : undefined,
  };

  // Validate query parameters
  const { valid, errors } = validateRequest(queryData, exportSchema);
  if (!valid) {
    throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid query parameters', {
      errors,
    });
  }

  const generation = getGeneration(id);
  if (!generation) {
    throw new ApiException(404, 'NOT_FOUND', 'Generation not found');
  }
  if (generation.status !== 'completed' || !generation.musicgenId) {
    throw new ApiException(409, 'NOT_READY', 'Generation is not yet complete');
  }

  // The MusicGen service only produces WAV — it has no format-conversion
  // capability. Rather than fabricate an mp3/flac download that doesn't
  // exist, reject unsupported formats explicitly.
  if (queryData.format !== 'wav') {
    throw new ApiException(
      501,
      'FORMAT_NOT_SUPPORTED',
      `Export format "${queryData.format}" is not supported yet — only "wav" is currently available from the MusicGen service.`
    );
  }

  const response: SunoExportResponse = {
    id,
    format: 'wav',
    downloadUrl: `/api/suno/audio/${generation.musicgenId}`,
    expiresIn: 3600, // matches the MusicGen service's in-memory result cache window
  };

  return successResponse(response);
}

export async function GET(
  request: NextRequest,
  context: any = {}
) {
  const { params = {} } = context;
  return withMiddleware(exportMusic)(request, { params: params as Record<string, string> });
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
