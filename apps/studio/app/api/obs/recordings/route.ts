/**
 * GET /api/obs/recordings
 * List all recordings with pagination and filtering
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
import { UserContext } from '@/types/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const listRecordingsSchema: ValidationSchema = {
  page: {
    type: 'number',
    required: false,
    min: 1,
  },
  limit: {
    type: 'number',
    required: false,
    min: 1,
    max: 100,
  },
  platform: {
    type: 'string',
    required: false,
  },
  format: {
    type: 'string',
    required: false,
    enum: ['MP4', 'MKV', 'WEBM'],
  },
  sortBy: {
    type: 'string',
    required: false,
    enum: ['date', 'size', 'duration', 'platform'],
  },
  sortOrder: {
    type: 'string',
    required: false,
    enum: ['asc', 'desc'],
  },
};

async function listRecordings(
  request: NextRequest,
  user: UserContext | null
): Promise<NextResponse> {
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const url = new URL(request.url);
  const query: Record<string, any> = {
    page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : 1,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 20,
    platform: url.searchParams.get('platform'),
    format: url.searchParams.get('format'),
    sortBy: url.searchParams.get('sortBy') || 'date',
    sortOrder: url.searchParams.get('sortOrder') || 'desc',
  };

  const { valid, errors } = validateRequest(query, listRecordingsSchema);
  if (!valid) {
    throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid query parameters', { errors });
  }

  // TODO: Query database for recordings
  // const recordings = await prisma.localStreamRecording.findMany({
  //   where: {
  //     ...(query.platform && { platform: query.platform }),
  //     ...(query.format && { format: query.format }),
  //     userId: user.id,
  //   },
  //   orderBy: {
  //     [query.sortBy]: query.sortOrder,
  //   },
  //   skip: (query.page - 1) * query.limit,
  //   take: query.limit,
  // });
  //
  // const total = await prisma.localStreamRecording.count({
  //   where: {
  //     ...(query.platform && { platform: query.platform }),
  //     ...(query.format && { format: query.format }),
  //     userId: user.id,
  //   },
  // });

  const response = {
    status: 'success',
    data: {
      recordings: [] as any[],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: 0,
        pages: 0,
      },
    },
  };

  return successResponse(response);
}

export async function GET(request: NextRequest, context: any = {}) {
  const { params = {} } = context;
  return withMiddleware(listRecordings)(request, { params: params as Record<string, string> });
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
