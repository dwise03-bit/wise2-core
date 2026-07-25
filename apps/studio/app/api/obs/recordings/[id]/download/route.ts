/**
 * GET /api/obs/recordings/[id]/download
 * Download a recording file
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import {
  withMiddleware,
  requireAuth,
  ApiException,
} from '@/lib/api-middleware';
import { UserContext } from '@/types/api';

async function downloadRecording(
  request: NextRequest,
  user: UserContext | null,
  params: Record<string, string>
): Promise<NextResponse> {
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const recordingId = params.id;
  if (!recordingId) {
    throw new ApiException(400, 'VALIDATION_ERROR', 'Recording ID is required');
  }

  try {
    // TODO: Fetch recording from database to verify ownership
    // const recording = await prisma.localStreamRecording.findUnique({
    //   where: { id: recordingId },
    // });
    //
    // if (!recording || recording.userId !== user.id) {
    //   return new NextResponse('Not found', { status: 404 });
    // }

    // For now, construct path from common patterns
    // In production, use database-stored path
    const publicDir = join(process.cwd(), 'public');

    // Try to find the file (this is a simplified version)
    // In production, get exact path from database
    const recordingsDir = join(publicDir, 'recordings');

    // Read file
    // Note: In production, verify the path is within recordings directory
    // and doesn't allow directory traversal
    const filePath = join(recordingsDir, `${recordingId}.mp4`);

    let fileBuffer: Buffer;
    try {
      fileBuffer = await readFile(filePath);
    } catch {
      throw new ApiException(404, 'NOT_FOUND', 'Recording file not found');
    }

    // Return file as download
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${recordingId}.mp4"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

    return response;
  } catch (error: any) {
    if (error.code === 'VALIDATION_ERROR' || error.code === 404) {
      throw error;
    }

    console.error('Error downloading recording:', error);
    throw new ApiException(500, 'INTERNAL_ERROR', 'Failed to download recording');
  }
}

export async function GET(request: NextRequest, context: any = {}) {
  const { params = {} } = context;
  return withMiddleware((req, user) =>
    downloadRecording(req, user, params as Record<string, string>)
  )(request, { params: params as Record<string, string> });
}

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
