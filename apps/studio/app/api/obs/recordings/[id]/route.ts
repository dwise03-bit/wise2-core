/**
 * GET /api/obs/recordings/[id] - Get recording details
 * DELETE /api/obs/recordings/[id] - Delete recording
 * PATCH /api/obs/recordings/[id] - Update recording metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import {
  withMiddleware,
  requireAuth,
  successResponse,
  ApiException,
  validateRequest,
  ValidationSchema,
} from '@/lib/api-middleware';
import { UserContext } from '@/types/api';

const updateRecordingSchema: ValidationSchema = {
  title: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 255,
  },
  description: {
    type: 'string',
    required: false,
    maxLength: 1000,
  },
  platform: {
    type: 'string',
    required: false,
  },
  streamTitle: {
    type: 'string',
    required: false,
    maxLength: 255,
  },
};

async function getRecording(
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

  // TODO: Query database
  // const recording = await prisma.localStreamRecording.findUnique({
  //   where: { id: recordingId },
  // });
  //
  // if (!recording || recording.userId !== user.id) {
  //   return notFoundResponse({ message: 'Recording not found' });
  // }

  const response = {
    status: 'success',
    data: {
      // recording data
    },
  };

  return successResponse(response);
}

async function deleteRecording(
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
    // TODO: Delete from database
    // const recording = await prisma.localStreamRecording.findUnique({
    //   where: { id: recordingId },
    // });
    //
    // if (!recording || recording.userId !== user.id) {
    //   return notFoundResponse({ message: 'Recording not found' });
    // }
    //
    // // Delete files from disk
    // if (recording.filePath) {
    //   try {
    //     await unlink(join(process.cwd(), 'public', recording.filePath));
    //   } catch (e) {
    //     console.warn('Failed to delete file:', recording.filePath);
    //   }
    // }
    //
    // if (recording.videoTrackPath) {
    //   try {
    //     await unlink(join(process.cwd(), 'public', recording.videoTrackPath));
    //   } catch (e) {
    //     console.warn('Failed to delete video track:', recording.videoTrackPath);
    //   }
    // }
    //
    // if (recording.audioTrackPath) {
    //   try {
    //     await unlink(join(process.cwd(), 'public', recording.audioTrackPath));
    //   } catch (e) {
    //     console.warn('Failed to delete audio track:', recording.audioTrackPath);
    //   }
    // }
    //
    // // Delete from database
    // await prisma.localStreamRecording.delete({
    //   where: { id: recordingId },
    // });

    return successResponse({ message: 'Recording deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting recording:', error);
    throw new ApiException(500, 'INTERNAL_ERROR', 'Failed to delete recording');
  }
}

async function updateRecording(
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

  const { valid, errors } = validateRequest(body, updateRecordingSchema);
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
    //     ...(body.title && { title: body.title }),
    //     ...(body.description && { description: body.description }),
    //     ...(body.platform && { platform: body.platform }),
    //     ...(body.streamTitle && { streamTitle: body.streamTitle }),
    //   },
    // });

    const response = {
      status: 'updated',
      recordingId,
      updatedAt: new Date().toISOString(),
    };

    return successResponse(response);
  } catch (error: any) {
    console.error('Error updating recording:', error);
    throw new ApiException(500, 'INTERNAL_ERROR', 'Failed to update recording');
  }
}

async function handler(
  request: NextRequest,
  user: UserContext | null,
  params: Record<string, string>
): Promise<NextResponse> {
  switch (request.method) {
    case 'GET':
      return getRecording(request, user, params);
    case 'DELETE':
      return deleteRecording(request, user, params);
    case 'PATCH':
      return updateRecording(request, user, params);
    default:
      return new NextResponse('Method not allowed', { status: 405 });
  }
}

export async function GET(request: NextRequest, context: any = {}) {
  const { params = {} } = context;
  return withMiddleware((req, user) => handler(req, user, params as Record<string, string>))(request, {
    params: params as Record<string, string>,
  });
}

export async function DELETE(request: NextRequest, context: any = {}) {
  const { params = {} } = context;
  return withMiddleware((req, user) => handler(req, user, params as Record<string, string>))(request, {
    params: params as Record<string, string>,
  });
}

export async function PATCH(request: NextRequest, context: any = {}) {
  const { params = {} } = context;
  return withMiddleware((req, user) => handler(req, user, params as Record<string, string>))(request, {
    params: params as Record<string, string>,
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
