import { NextRequest, NextResponse } from 'next/server';
import { GeneratedTrack } from '@/types/aimusic';

/**
 * GET /api/musicgen/generations
 * Fetch generated music tracks with pagination
 * Query params:
 *   - limit: number (default 20)
 *   - offset: number (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // TODO: Replace with actual database query
    // For now, return mock data
    const tracks: GeneratedTrack[] = [];

    return NextResponse.json({
      tracks,
      hasMore: false,
      total: 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Failed to fetch generations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generations' },
      { status: 500 }
    );
  }
}
