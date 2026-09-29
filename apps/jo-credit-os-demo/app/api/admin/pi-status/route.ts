import { NextRequest, NextResponse } from 'next/server';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  networkBytesIn: number;
  networkBytesOut: number;
  uptime: number;
}

interface Service {
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: number;
  port?: number;
  restarts: number;
}

interface LogEntry {
  timestamp: string;
  level: 'error' | 'info' | 'warn';
  service: string;
  message: string;
}

interface Backup {
  timestamp: string;
  size: number;
  status: 'success' | 'failed';
  path: string;
}

interface Update {
  name: string;
  currentVersion: string;
  availableVersion: string;
  type: 'docker' | 'system';
  critical: boolean;
}

interface Alert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  service?: string;
  resolved: boolean;
}

interface Deployment {
  id: string;
  timestamp: string;
  version: string;
  status: 'success' | 'failed' | 'in-progress';
  duration: number;
  changedFiles: number;
}

interface PiStatus {
  model: string;
  osVersion: string;
  architecture: string;
  hostname: string;
  timestamp: string;
  metrics: SystemMetrics;
  services: Service[];
  logs: LogEntry[];
  lastBackup: Backup | null;
  nextBackupScheduled: string;
  updates: Update[];
  alerts: Alert[];
  deployments: Deployment[];
}

/**
 * GET /api/admin/pi-status
 * Fetch real-time Raspberry Pi health and status information
 * Used by the Pi Status Dashboard for monitoring
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement proper authentication check
    // const token = request.headers.get('authorization');
    // if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Generate mock data matching current timestamp
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const oneDayAgo = new Date(now.getTime() - 86400000);
    const threeDaysAgo = new Date(now.getTime() - 259200000);

    // TODO: Replace with actual system data collection via:
    // - OS API calls to get CPU, memory, disk usage
    // - systemctl queries for service status
    // - Log file parsing
    // - SSH calls to remote Pi
    // - Docker API for container status

    const mockStatus: PiStatus = {
      model: 'Raspberry Pi 4 Model B',
      osVersion: 'Raspberry Pi OS (64-bit) v12.4',
      architecture: 'ARMv8 64-bit',
      hostname: 'wise2-pi',
      timestamp: now.toISOString(),
      metrics: {
        cpu: 34,
        memory: 58,
        disk: 72,
        networkBytesIn: 1024 * 512, // 512 KB/s
        networkBytesOut: 1024 * 256, // 256 KB/s
        uptime: 45 * 86400 + 12345, // 45 days
      },
      services: [
        {
          name: 'API Service',
          status: 'running',
          uptime: 30 * 86400, // 30 days
          port: 3001,
          restarts: 2,
        },
        {
          name: 'Website',
          status: 'running',
          uptime: 30 * 86400,
          port: 3000,
          restarts: 1,
        },
        {
          name: 'Database',
          status: 'running',
          uptime: 45 * 86400,
          port: 5432,
          restarts: 0,
        },
        {
          name: 'Redis Cache',
          status: 'running',
          uptime: 45 * 86400,
          port: 6379,
          restarts: 0,
        },
      ],
      logs: [
        {
          timestamp: new Date(now.getTime() - 60000).toISOString(),
          level: 'info',
          service: 'API Service',
          message: 'Completed database migration v12.4.0',
        },
        {
          timestamp: new Date(now.getTime() - 120000).toISOString(),
          level: 'info',
          service: 'Website',
          message: 'Static asset cache refreshed',
        },
        {
          timestamp: new Date(now.getTime() - 180000).toISOString(),
          level: 'warn',
          service: 'Database',
          message: 'Memory usage above 80%, consider cleanup',
        },
        {
          timestamp: new Date(now.getTime() - 240000).toISOString(),
          level: 'info',
          service: 'Redis Cache',
          message: 'Cache eviction policy activated',
        },
        {
          timestamp: new Date(now.getTime() - 300000).toISOString(),
          level: 'info',
          service: 'API Service',
          message: 'Successfully authenticated 143 requests',
        },
        {
          timestamp: new Date(now.getTime() - 360000).toISOString(),
          level: 'error',
          service: 'API Service',
          message: 'Failed to connect to external API (retry 3/5)',
        },
        {
          timestamp: new Date(now.getTime() - 420000).toISOString(),
          level: 'info',
          service: 'Website',
          message: 'Deployed version 2.1.4',
        },
        {
          timestamp: new Date(now.getTime() - 480000).toISOString(),
          level: 'warn',
          service: 'System',
          message: 'Disk I/O latency increased to 45ms',
        },
        {
          timestamp: new Date(now.getTime() - 540000).toISOString(),
          level: 'info',
          service: 'Database',
          message: 'Completed automatic backup',
        },
        {
          timestamp: new Date(now.getTime() - 600000).toISOString(),
          level: 'info',
          service: 'API Service',
          message: 'Rate limit reset for API key USR-12345',
        },
      ],
      lastBackup: {
        timestamp: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
        size: 1024 * 1024 * 1024 * 4.2, // 4.2 GB
        status: 'success',
        path: '/backups/wise2-20260723-010000.tar.gz',
      },
      nextBackupScheduled: new Date(now.getTime() + 82800000).toISOString(), // 23 hours from now
      updates: [
        {
          name: 'Docker Engine',
          currentVersion: '24.0.5',
          availableVersion: '25.0.1',
          type: 'docker',
          critical: false,
        },
        {
          name: 'Node.js Runtime',
          currentVersion: '18.16.0',
          availableVersion: '20.4.0',
          type: 'system',
          critical: false,
        },
      ],
      alerts: [
        {
          id: 'ALR-001',
          timestamp: new Date(now.getTime() - 7200000).toISOString(),
          severity: 'warning',
          title: 'Memory Usage High',
          description: 'System memory usage exceeded 75% threshold',
          service: 'System',
          resolved: false,
        },
        {
          id: 'ALR-002',
          timestamp: new Date(now.getTime() - 14400000).toISOString(),
          severity: 'info',
          title: 'Scheduled Backup Completed',
          description: 'Daily backup completed successfully (4.2 GB)',
          service: 'Backups',
          resolved: true,
        },
        {
          id: 'ALR-003',
          timestamp: new Date(now.getTime() - 86400000).toISOString(),
          severity: 'warning',
          title: 'Disk Space Low',
          description: 'Available disk space below 25%',
          service: 'Storage',
          resolved: false,
        },
        {
          id: 'ALR-004',
          timestamp: new Date(now.getTime() - 604800000).toISOString(),
          severity: 'info',
          title: 'Service Restart',
          description: 'API Service restarted due to memory leak detection',
          service: 'API Service',
          resolved: true,
        },
      ],
      deployments: [
        {
          id: 'DEP-042',
          timestamp: now.toISOString(),
          version: '2.1.4',
          status: 'success',
          duration: 145,
          changedFiles: 23,
        },
        {
          id: 'DEP-041',
          timestamp: new Date(now.getTime() - 86400000).toISOString(),
          version: '2.1.3',
          status: 'success',
          duration: 128,
          changedFiles: 12,
        },
        {
          id: 'DEP-040',
          timestamp: new Date(now.getTime() - 172800000).toISOString(),
          version: '2.1.2',
          status: 'success',
          duration: 156,
          changedFiles: 45,
        },
        {
          id: 'DEP-039',
          timestamp: new Date(now.getTime() - 259200000).toISOString(),
          version: '2.1.1',
          status: 'failed',
          duration: 89,
          changedFiles: 8,
        },
        {
          id: 'DEP-038',
          timestamp: new Date(now.getTime() - 345600000).toISOString(),
          version: '2.1.0',
          status: 'success',
          duration: 134,
          changedFiles: 62,
        },
      ],
    };

    return NextResponse.json(mockStatus, { status: 200 });
  } catch (error) {
    console.error('Error fetching Pi status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pi status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pi-status/actions
 * Trigger actions like backup, update, service restart
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, target } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    // TODO: Implement actual actions
    // - action: 'backup' → trigger backup script
    // - action: 'restart' → restart service
    // - action: 'update' → run update
    // - action: 'logs' → fetch logs with filters

    const result = {
      action,
      target,
      status: 'queued',
      message: `${action} request for ${target} has been queued`,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    console.error('Error processing Pi action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
