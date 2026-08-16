/**
 * System Metrics API
 * GET /api/v1/metrics/system
 *
 * Returns infrastructure and deployment metrics
 */

export async function GET(request: Request) {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);

    // Mock system metrics (in production, these come from actual system monitoring)
    const metrics = {
      timestamp: now.toISOString(),
      git: {
        branch: 'main',
        aheadBehind: {
          ahead: 3,
          behind: 0,
        },
        lastCommit: '2026-07-20T21:30:00Z',
        uncommitted: 0,
      },
      docker: {
        containers: [
          {
            name: 'wise2-api',
            status: 'running',
            cpu: 2.5,
            memory: 256,
            restarts: 0,
          },
          {
            name: 'wise2-website',
            status: 'running',
            cpu: 1.8,
            memory: 128,
            restarts: 0,
          },
          {
            name: 'wise2-db',
            status: 'running',
            cpu: 8.2,
            memory: 512,
            restarts: 0,
          },
        ],
      },
      website: {
        responseTime: 145,
        errorRate: 0.02,
        uptime: 99.98,
        requestsPerMinute: 450,
      },
      database: {
        responseTime: 12,
        connectionPool: {
          active: 8,
          max: 20,
        },
        diskUsage: {
          used: 4.2,
          total: 10,
        },
        lastBackup: '2026-07-20T02:00:00Z',
      },
      deployments: {
        total: 42,
        thisWeek: 7,
        successRate: 98.5,
        avgDuration: 285,
        lastDeployment: '2026-07-20T21:15:00Z',
      },
    };

    return Response.json(metrics, {
      headers: {
        'Cache-Control': 'public, max-age=30',
      },
    });
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    return Response.json(
      { error: 'Failed to fetch system metrics' },
      { status: 500 }
    );
  }
}
