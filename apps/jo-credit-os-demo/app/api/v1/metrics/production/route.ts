/**
 * Production Metrics API
 * GET /api/v1/metrics/production
 *
 * Returns production statistics from user activity
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // today|week|month

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Mock production metrics (in production, these are aggregated from user_events)
    const metrics = {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      songs: {
        total: period === 'today' ? 12 : period === 'week' ? 78 : 245,
        trend: period === 'today' ? 0 : period === 'week' ? 15 : 22,
      },
      videos: {
        total: period === 'today' ? 8 : period === 'week' ? 42 : 189,
        trend: period === 'today' ? 0 : period === 'week' ? -5 : 18,
      },
      designs: {
        total: period === 'today' ? 5 : period === 'week' ? 31 : 156,
        trend: period === 'today' ? 0 : period === 'week' ? 12 : 24,
      },
      averageProjectSize: 42, // MB
      averageRenderingTime: 180, // seconds
      byType: [
        { type: 'Music', count: 245, percent: 38 },
        { type: 'Video', count: 189, percent: 30 },
        { type: 'Design', count: 156, percent: 24 },
        { type: 'Other', count: 72, percent: 8 },
      ],
    };

    return Response.json(metrics, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error fetching production metrics:', error);
    return Response.json(
      { error: 'Failed to fetch production metrics' },
      { status: 500 }
    );
  }
}
