/**
 * User Metrics API
 * GET /api/v1/metrics/users
 *
 * Returns user engagement and activity metrics
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    // Mock user metrics (in production, these are aggregated from user_events)
    const metrics = {
      period,
      users: {
        total: 3240,
        today: 234,
        this_week: 1250,
        this_month: 2890,
        new_today: 18,
        new_this_week: 145,
        active_sessions: 42,
      },
      engagement: {
        avg_session_duration: 1850, // seconds
        sessions_per_user: 3.2,
        returning_user_rate: 68, // %
        churn_this_week: 4.2, // %
      },
      feature_usage: {
        sound_lab: 42,
        live_studio: 28,
        content_factory: 18,
        jingle_lab: 8,
        voice_lab: 4,
      },
      activity_by_hour: {
        peak_hours: [14, 15, 16],
        peak_days: ['Wed', 'Thu', 'Fri'],
        low_activity: ['Sun', 'Mon'],
      },
    };

    return Response.json(metrics, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    return Response.json(
      { error: 'Failed to fetch user metrics' },
      { status: 500 }
    );
  }
}
