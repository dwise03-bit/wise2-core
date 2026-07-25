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
    format: searchParams.get('format') || 'mp3',
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

  // TODO: Check that generation exists and belongs to user
  // const generation = await db.generations.findUnique({
  //   where: { id, userId: user.id }
  // });
  // if (!generation) {
  //   throw new ApiException(404, 'NOT_FOUND', 'Generation not found');
  // }
  // if (generation.status !== 'completed') {
  //   throw new ApiException(409, 'NOT_READY', 'Generation is not yet complete');
  // }

  // TODO: Trigger export conversion job
  // const exportJob = await sunoClient.export(id, queryData.format, {
  //   bitrate: queryData.bitrate
  // });

  // Mock response
  const response: SunoExportResponse = {
    id,
    format: queryData.format,
    downloadUrl: `https://example.com/exports/${id}.${queryData.format}`,
    expiresIn: 86400, // 24 hours
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
