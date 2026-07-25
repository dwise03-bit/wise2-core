/**
 * PATCH /api/obs/recordings/metadata/[id]
 * Update recording metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  successResponse,
  notFoundResponse,
  validateRequest,
  ApiException,
  ValidationSchema,
} from '@/lib/api-middleware';
import { UserContext } from '@/types/api';

const updateMetadataSchema: ValidationSchema = {
  fileSize: {
    type: 'number',
    required: false,
    min: 0,
  },
  duration: {
    type: 'number',
    required: false,
    min: 0,
  },
  status: {
    type: 'string',
    required: false,
    enum: ['IDLE', 'RECORDING', 'PAUSED', 'STOPPED', 'PROCESSING', 'FAILED'],
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
  videoTrackPath: {
    type: 'string',
    required: false,
  },
  audioTrackPath: {
    type: 'string',
    required: false,
  },
  audioTracks: {
    type: 'object',
    required: false,
  },
};

async function updateMetadata(
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

  const body = (await request.json()) as Record<string, unknown>;

  const { valid, errors } = validateRequest(body, updateMetadataSchema);
  if (!valid) {
    throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid request data', { errors });
  }

  try {
    // TODO: Update database
    // const recording = await prisma.localStreamRecording.findUnique({
    //   where: { id: recordingId },
    // });
    //
    // if (!recording || recording.userId !== user.id) {
    //   return notFoundResponse({ message: 'Recording not found' });
    // }
    //
    // const updated = await prisma.localStreamRecording.update({
    //   where: { id: recordingId },
    //   data: {
    //     ...(body.fileSize !== undefined && { fileSize: body.fileSize }),
    //     ...(body.duration !== undefined && { duration: body.duration }),
    //     ...(body.status && { status: body.status }),
    //     ...(body.stoppedAt && { stoppedAt: new Date(body.stoppedAt as string) }),
    //     ...(body.isSplit !== undefined && { isSplit: body.isSplit }),
    //     ...(body.splitParts !== undefined && { splitParts: body.splitParts }),
    //     ...(body.videoTrackPath && { videoTrackPath: body.videoTrackPath }),
    //     ...(body.audioTrackPath && { audioTrackPath: body.audioTrackPath }),
    //     ...(body.audioTracks && { audioTracks: body.audioTracks }),
    //   },
    // });

    const response = {
      status: 'updated',
      recordingId,
      updatedAt: new Date().toISOString(),
      changes: Object.keys(body).length,
    };

    return successResponse(response);
  } catch (error: any) {
    console.error('Error updating metadata:', error);
    throw new ApiException(500, 'INTERNAL_ERROR', 'Failed to update recording metadata');
  }
}

export async function PATCH(request: NextRequest, context: any = {}) {
  const { params = {} } = context;
  return withMiddleware((req, user) =>
    updateMetadata(req, user, params as Record<string, string>)
  )(request, { params: params as Record<string, string> });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
