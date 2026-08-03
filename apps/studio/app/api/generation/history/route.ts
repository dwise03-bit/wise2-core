/**
 * GET /api/generation/history
 * Get paginated list of user's generations with filtering
 *
 * Query parameters:
 * - page?: number - Page number (default 1)
 * - pageSize?: number - Items per page (default 20, max 100)
 * - sortBy?: 'createdAt' | 'completedAt' | 'qualityScore' - Sort column
 * - sortOrder?: 'asc' | 'desc' - Sort direction
 * - status?: 'queued' | 'generating' | 'completed' | 'failed' - Filter by status
 * - dateFrom?: string - Filter by start date (ISO 8601)
 * - dateTo?: string - Filter by end date (ISO 8601)
 * - style?: string - Filter by genre/style
 * - mood?: string - Filter by mood
 * - favorite?: 'true' | 'false' - Filter by favorite status
 *
 * Response: GenerationHistoryResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  requireAuth,
  successResponse,
  ApiException,
} from '@/lib/api-middleware';
import {
  GenerationHistoryResponse,
  UserContext,
} from '@/types/api';
import { generationDb } from '@/lib/generation-db';

/**
 * Get generation history
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
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20')));
  const sortBy = (url.searchParams.get('sortBy') || 'createdAt') as 'createdAt' | 'completedAt' | 'qualityScore';
  const sortOrder = (url.searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  // Parse filters
  const filters: any = {};

  const status = url.searchParams.get('status');
  if (status) {
    filters.status = status;
  }

  const dateFrom = url.searchParams.get('dateFrom');
  const dateTo = url.searchParams.get('dateTo');
  if (dateFrom || dateTo) {
    filters.dateRange = {
      start: dateFrom || '1970-01-01',
      end: dateTo || new Date().toISOString(),
    };
  }

  const style = url.searchParams.get('style');
  if (style) {
    filters.style = style;
  }

  const mood = url.searchParams.get('mood');
  if (mood) {
    filters.mood = mood;
  }

  const favorite = url.searchParams.get('favorite');
  if (favorite === 'true') {
    filters.favorite = true;
  } else if (favorite === 'false') {
    filters.favorite = false;
  }

  // Query database
  const result = generationDb.query({
    userId: user.id,
    page,
    pageSize,
    sortBy,
    sortOrder,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
  });

  // Transform to history items
  const items = result.items.map(g => ({
    id: g.id,
    prompt: g.prompt,
    genre: g.genre,
    mood: g.mood,
    status: g.status,
    audioUrl: g.audioUrl,
    duration: g.duration,
    createdAt: g.createdAt,
    favorite: g.favorite || false,
    qualityScore: g.metadata?.qualityScore,
  }));

  const response: GenerationHistoryResponse = {
    items,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    hasMore: result.hasMore,
    filters: {
      status: filters.status,
      style: filters.style,
      mood: filters.mood,
      dateRange: filters.dateRange,
    },
  };

  return successResponse(response);
}

export async function GET(
  request: NextRequest,
  context: any = {}
) {
  const { params = {} } = context;
  return withMiddleware(getHistory)(request, { params: params as Record<string, string> });
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
