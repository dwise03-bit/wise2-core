import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/musicgen/status
 * Poll for generation status updates
 * Query params:
 *   - generationIds: comma-separated list of generation IDs to poll
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const generationIds = searchParams.get('generationIds')?.split(',') || [];

    // TODO: Replace with actual database query for generation status
    const updates = generationIds.map(id => ({
      id,
      progress: 0,
      status: 'queued' as const,
      estimatedTime: 60,
    }));

    return NextResponse.json({
      updates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch generation status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generation status' },
      { status: 500 }
    );
  }
}
