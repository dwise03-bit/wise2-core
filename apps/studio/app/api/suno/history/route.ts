/**
 * GET /api/suno/history
 * Retrieve paginated user generation history
 *
 * Query params:
 * - page?: number - Page number (default: 1)
 * - pageSize?: number - Items per page (default: 20, max: 100)
 * - sortBy?: string - Sort field (createdAt, updatedAt, status)
 * - sortOrder?: 'asc' | 'desc' - Sort direction
 *
 * Response: SunoHistoryResponse (paginated)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  successResponse,
  validateRequest,
  ApiException,
} from '@/lib/api-middleware';
import {
  SunoHistoryResponse,
  SunoHistoryItem,
  ValidationSchema,
} from '@/types/api';
import { UserContext } from '@/types/api';

// Validation schema for query params
const querySchema: ValidationSchema = {
  page: {
    type: 'number',
    required: false,
    min: 1,
  },
  pageSize: {
    type: 'number',
    required: false,
    min: 1,
    max: 100,
  },
  sortBy: {
    type: 'string',
    required: false,
    enum: ['createdAt', 'updatedAt', 'status'],
  },
  sortOrder: {
    type: 'string',
    required: false,
    enum: ['asc', 'desc'],
  },
};

/**
 * Get generation history with pagination
 * Requires authentication
 */
async function getHistory(
  request: NextRequest,
  user: UserContext | null
): Promise<NextResponse> {
  // Require authentication
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const queryData = {
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    pageSize: searchParams.get('pageSize')
      ? parseInt(searchParams.get('pageSize')!)
      : 20,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  };

  // Validate query parameters
  const { valid, errors } = validateRequest(queryData, querySchema);
  if (!valid) {
    throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid query parameters', {
      errors,
    });
  }

  // Ensure pageSize doesn't exceed max
  const pageSize = Math.min(queryData.pageSize, 100);
  const page = Math.max(queryData.page, 1);

  // TODO: Fetch from database
  // const [items, total] = await db.generations.findAndCount({
  //   where: { userId: user.id },
  //   skip: (page - 1) * pageSize,
  //   take: pageSize,
  //   orderBy: { [queryData.sortBy]: queryData.sortOrder }
  // });

  // Mock data for demonstration
  const mockItems: SunoHistoryItem[] = [
    {
      id: 'gen_1721873400000_abc123def',
      prompt: 'Uplifting electronic dance music with synth lead',
      style: 'EDM',
      status: 'completed',
      musicUrl:
        'https://example.com/music/gen_1721873400000_abc123def.mp3',
      duration: 180,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86300000).toISOString(),
    },
    {
      id: 'gen_1721786000000_xyz789',
      prompt: 'Chill lo-fi hip hop beats for studying',
      style: 'Lo-Fi Hip Hop',
      status: 'completed',
      musicUrl:
        'https://example.com/music/gen_1721786000000_xyz789.mp3',
      duration: 240,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172700000).toISOString(),
    },
    {
      id: 'gen_1721700000000_pqr456',
      prompt: 'Classical piano concerto in C major',
      style: 'Classical',
      status: 'failed',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 259100000).toISOString(),
    },
  ];

  const total = mockItems.length;
  const items = mockItems.slice((page - 1) * pageSize, page * pageSize);
  const hasMore = page * pageSize < total;

  const response: SunoHistoryResponse = {
    items,
    total,
    page,
    pageSize,
    hasMore,
  };

  return successResponse(response);
}

export const GET = withMiddleware(getHistory);

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
