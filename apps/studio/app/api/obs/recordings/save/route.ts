/**
 * POST /api/obs/recordings/save
 * Save recorded file to disk
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import {
  withMiddleware,
  requireAuth,
  createdResponse,
  ApiException,
} from '@/lib/api-middleware';
import { UserContext } from '@/types/api';

async function saveRecordingFile(
  request: NextRequest,
  user: UserContext | null
): Promise<NextResponse> {
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;
    const recordingId = formData.get('recordingId') as string;

    if (!file || !path || !recordingId) {
      throw new ApiException(400, 'VALIDATION_ERROR', 'Missing required fields: file, path, recordingId');
    }

    // Validate path to prevent directory traversal
    if (path.includes('..') || path.startsWith('/')) {
      throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid file path');
    }

    // Get public recordings directory
    const publicDir = join(process.cwd(), 'public', 'recordings');
    const filePath = join(publicDir, path);

    // Ensure directory exists
    await mkdir(dirname(filePath), { recursive: true });

    // Convert file to buffer and write
    const buffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    const response = {
      status: 'file_saved',
      recordingId,
      path,
      fileSize: buffer.byteLength,
      savedAt: new Date().toISOString(),
    };

    return createdResponse(response);
  } catch (error: any) {
    if (error.code === 'VALIDATION_ERROR') {
      throw error;
    }

    console.error('Error saving recording file:', error);
    throw new ApiException(500, 'INTERNAL_ERROR', 'Failed to save recording file');
  }
}

export async function POST(request: NextRequest, context: any = {}) {
  const { params = {} } = context;
  return withMiddleware(saveRecordingFile)(request, { params: params as Record<string, string> });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
