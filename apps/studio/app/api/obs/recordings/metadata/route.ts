/**
 * POST /api/obs/recordings/metadata
 * Save or update recording metadata in database
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  createdResponse,
  validateRequest,
  ApiException,
  ValidationSchema,
} from '@/lib/api-middleware';
import { UserContext } from '@/types/api';

const metadataSchema: ValidationSchema = {
  id: {
    type: 'string',
    required: true,
    minLength: 1,
  },
  title: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 255,
  },
  description: {
    type: 'string',
    required: false,
  },
  filePath: {
    type: 'string',
    required: true,
    minLength: 1,
  },
  fileSize: {
    type: 'number',
    required: true,
    min: 0,
  },
  duration: {
    type: 'number',
    required: false,
    min: 0,
  },
  format: {
    type: 'string',
    required: true,
    enum: ['MP4', 'MKV', 'WEBM'],
  },
  platform: {
    type: 'string',
    required: false,
  },
  streamTitle: {
    type: 'string',
    required: false,
  },
  status: {
    type: 'string',
    required: false,
    enum: ['IDLE', 'RECORDING', 'PAUSED', 'STOPPED', 'PROCESSING', 'FAILED'],
  },
  quality: {
    type: 'string',
    required: false,
  },
  bitrate: {
    type: 'number',
    required: false,
  },
  startedAt: {
    type: 'string',
    required: true,
  },
  stoppedAt: {
    type: 'string',
    required: false,
  },
  isSplit: {
    type: 'boolean',
    required: false,
  },
  splitParts: {
    type: 'number',
    required: false,
  },
};

async function saveMetadata(
  request: NextRequest,
  user: UserContext | null
): Promise<NextResponse> {
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const body = (await request.json()) as Record<string, unknown>;

  const { valid, errors } = validateRequest(body, metadataSchema);
  if (!valid) {
    throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid request data', { errors });
  }

  try {
    // TODO: Save to database using Prisma
    // const recording = await prisma.localStreamRecording.create({
    //   data: {
    //     id: body.id as string,
    //     title: body.title as string,
    //     description: body.description as string | undefined,
    //     filePath: body.filePath as string,
    //     fileSize: body.fileSize as number,
    //     duration: body.duration as number | undefined,
    //     format: body.format as 'MP4' | 'MKV' | 'WEBM',
    //     platform: body.platform as string | undefined,
    //     streamTitle: body.streamTitle as string | undefined,
    //     status: body.status as any || 'RECORDING',
    //     quality: body.quality as string || 'high',
    //     bitrate: body.bitrate as number || 5000,
    //     startedAt: new Date(body.startedAt as string),
    //     stoppedAt: body.stoppedAt ? new Date(body.stoppedAt as string) : undefined,
    //     isSplit: body.isSplit as boolean || false,
    //     splitParts: body.splitParts as number || 1,
    //     userId: user.id,
    //     audioTracks: body.audioTracks || [],
    //   },
    // });

    const response = {
      status: 'metadata_saved',
      recordingId: body.id,
      title: body.title,
      filePath: body.filePath,
      format: body.format,
      savedAt: new Date().toISOString(),
    };

    return createdResponse(response);
  } catch (error: any) {
    console.error('Error saving metadata:', error);
    throw new ApiException(500, 'INTERNAL_ERROR', 'Failed to save recording metadata');
  }
}

export async function POST(request: NextRequest, context: any = {}) {
  const { params = {} } = context;
  return withMiddleware(saveMetadata)(request, { params: params as Record<string, string> });
}

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
