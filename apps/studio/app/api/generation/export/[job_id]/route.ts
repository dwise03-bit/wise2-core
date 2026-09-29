/**
 * POST /api/generation/export/[job_id]
 * Export a generation in different format
 *
 * Request body:
 * - format: 'mp3' | 'wav' | 'flac' | 'opus' | 'ogg' (required)
 * - sampleRate?: number - 44100, 48000, 96000 (default 44100)
 * - bitDepth?: number - 16, 24, 32 (default 16)
 *
 * Response: ExportResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  validateRequest,
  successResponse,
  ApiException,
  ValidationSchema,
} from '@/lib/api-middleware';
import {
  ExportRequest,
  ExportResponse,
  UserContext,
} from '@/types/api';
import { generationDb } from '@/lib/generation-db';

// Validation schema
const exportSchema: ValidationSchema = {
  format: {
    type: 'string',
    required: true,
    enum: ['mp3', 'wav', 'flac', 'opus', 'ogg'],
  },
  sampleRate: {
    type: 'number',
    required: false,
    enum: [44100, 48000, 96000],
  },
  bitDepth: {
    type: 'number',
    required: false,
    enum: [16, 24, 32],
  },
};

/**
 * Export generation in specific format
 * Requires authentication
 */
async function exportGeneration(
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
      'Generation must be completed before exporting'
    );
  }

  // Parse and validate request body
  const body = (await request.json()) as Record<string, unknown>;
  const { valid, errors } = validateRequest(body, exportSchema);
  if (!valid) {
    throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid request data', {
      errors,
    });
  }

  const format = body.format as any as 'mp3' | 'wav' | 'flac' | 'opus' | 'ogg';
  const sampleRate = (body.sampleRate as any as number) || 44100;
  const bitDepth = (body.bitDepth as any as number) || 16;

  // Generate export URL
  // In production, this would trigger an async transcoding job
  const exportJobId = `export_${jobId}_${format}_${Date.now()}`;

  // Generate signed S3 URL with expiration
  const downloadUrl = generateSignedExportUrl(jobId, format, sampleRate, bitDepth);
  const expiresIn = 86400; // 24 hours

  const response: ExportResponse = {
    jobId: exportJobId,
    format,
    downloadUrl,
    expiresIn,
  };

  return successResponse(response, 202); // 202 Accepted
}

/**
 * Generate signed S3 URL for export
 * In production, would use AWS SDK to generate presigned URLs
 */
function generateSignedExportUrl(
  jobId: string,
  format: string,
  sampleRate: number,
  bitDepth: number
): string {
  // Mock S3 URL with query parameters
  const baseUrl = `${process.env.S3_ENDPOINT || 'https://s3.amazonaws.com'}/wise2-generations`;
  const filename = `${jobId}_${sampleRate}hz_${bitDepth}bit.${format}`;
  const url = new URL(`${baseUrl}/${filename}`);

  // Add mock parameters
  url.searchParams.set('X-Amz-Expires', '86400');
  url.searchParams.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
  url.searchParams.set('X-Amz-Date', new Date().toISOString());

  return url.toString();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  return withMiddleware(exportGeneration)(request, { params });
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
