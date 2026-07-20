/**
 * Dashboard Metrics API
 * GET /api/v1/metrics/dashboard
 *
 * Returns aggregated metrics for dashboard display
 * Combines system, user, production, and revenue metrics
 */

export async function GET(request: Request) {
  try {
    const now = new Date();

    // This would normally call all the individual metrics endpoints
    // For now, returning aggregated mock data
    const metrics = {
      timestamp: now.toISOString(),
      kpis: [
        {
          title: 'Active Users Today',
          value: 234,
          trend: '+18%',
          icon: '👥',
          color: '#39FF14',
        },
        {
          title: 'AI Productions Week',
          value: 1247,
          trend: '+92%',
          icon: '🎵',
          color: '#0099ff',
        },
        {
          title: 'System Uptime',
          value: '99.98%',
          trend: '-0.02%',
          icon: '⚡',
          color: '#ff6600',
        },
        {
          title: 'Revenue Today',
          value: '$3,420',
          trend: '+156%',
          icon: '💰',
          color: '#00ff00',
        },
      ],
      charts: {
        revenue_trend: {
          type: 'line',
          title: 'Revenue Trend (30d)',
          data: [
            { date: 'Jul 1', amount: 2100 },
            { date: 'Jul 8', amount: 2450 },
            { date: 'Jul 15', amount: 3200 },
            { date: 'Jul 20', amount: 3420 },
          ],
        },
        production_by_type: {
          type: 'bar',
          title: 'Production by Type',
          data: [
            { type: 'Music', count: 245 },
            { type: 'Video', count: 189 },
            { type: 'Design', count: 156 },
          ],
        },
        feature_usage: {
          type: 'pie',
          title: 'Feature Usage',
          data: [
            { name: 'Sound Lab', value: 42, percent: 42 },
            { name: 'Live Studio', value: 28, percent: 28 },
            { name: 'Content Factory', value: 18, percent: 18 },
            { name: 'Jingle Lab', value: 8, percent: 8 },
            { name: 'Voice Lab', value: 4, percent: 4 },
          ],
        },
        system_health: {
          type: 'gauge',
          title: 'System Health',
          value: 98.5,
          status: 'excellent',
        },
      },
      recent_events: [
        {
          timestamp: '2 mins ago',
          event: 'Sound Lab session completed',
          user: 'User #2841',
          type: 'production',
        },
        {
          timestamp: '5 mins ago',
          event: 'Live stream broadcast ended',
          user: 'Creator #1205',
          type: 'broadcast',
        },
        {
          timestamp: '12 mins ago',
          event: 'Deployment successful',
          branch: 'main',
          type: 'deployment',
        },
      ],
    };

    return Response.json(metrics, {
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return Response.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}
