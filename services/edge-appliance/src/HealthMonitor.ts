import { EventEmitter } from 'events';
import pino from 'pino';
import { exec } from 'child_process';
import { promisify } from 'util';
import { EdgeRuntime, RuntimeStatus } from './EdgeRuntime';

const execAsync = promisify(exec);

export interface HealthMetrics {
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  temperature: number;
  uptime: number;
  componentStatus: Record<string, 'ready' | 'error' | 'offline'>;
}

export interface HealthAlert {
  id: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
  component: string;
  message: string;
  resolved: boolean;
}

export class HealthMonitor extends EventEmitter {
  private runtime: EdgeRuntime;
  private logger: pino.Logger;
  private initialized: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private checkIntervalMs: number = 30000; // 30 seconds
  private metrics: HealthMetrics[] = [];
  private maxMetricsHistory: number = 1440; // 12 hours at 30-second intervals
  private alerts: HealthAlert[] = [];
  private maxAlerts: number = 100;

  constructor(runtime: EdgeRuntime, logger: pino.Logger) {
    super();
    this.runtime = runtime;
    this.logger = logger;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('HealthMonitor already initialized');
      return;
    }

    try {
      // Start periodic health checks
      this.startHealthChecks();

      this.initialized = true;
      this.logger.info('HealthMonitor initialized');
    } catch (error) {
      this.logger.error(error, 'Failed to initialize HealthMonitor');
      throw error;
    }
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();
        this.metrics.push(metrics);

        // Trim history
        if (this.metrics.length > this.maxMetricsHistory) {
          this.metrics = this.metrics.slice(-this.maxMetricsHistory);
        }

        // Check for alerts
        await this.checkForAlerts(metrics);

        this.logger.debug(metrics, 'Health check completed');
        this.emit('health:check', metrics);
      } catch (error) {
        this.logger.error(error, 'Health check failed');
      }
    }, this.checkIntervalMs);

    this.logger.info(
      { intervalMs: this.checkIntervalMs },
      'Health checks started'
    );
  }

  private async collectMetrics(): Promise<HealthMetrics> {
    const [cpuUsage, memoryUsage, diskUsage, temperature] = await Promise.all([
      this.getCPUUsage(),
      this.getMemoryUsage(),
      this.getDiskUsage(),
      this.getTemperature(),
    ]);

    const status = this.runtime.getStatus();

    return {
      timestamp: Date.now(),
      cpuUsage,
      memoryUsage,
      diskUsage,
      temperature,
      uptime: status.uptime,
      componentStatus: status.components,
    };
  }

  private async getCPUUsage(): Promise<number> {
    try {
      const { stdout } = await execAsync(
        "top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1"
      );
      return parseFloat(stdout.trim()) || 0;
    } catch (error) {
      this.logger.debug('Could not get CPU usage');
      return 0;
    }
  }

  private async getMemoryUsage(): Promise<number> {
    try {
      const { stdout } = await execAsync(
        "free | grep Mem | awk '{printf(\"%.1f\", $3/$2 * 100.0)}'"
      );
      return parseFloat(stdout.trim()) || 0;
    } catch (error) {
      this.logger.debug('Could not get memory usage');
      return 0;
    }
  }

  private async getDiskUsage(): Promise<number> {
    try {
      const { stdout } = await execAsync(
        "df / | tail -1 | awk '{print $5}' | cut -d'%' -f1"
      );
      return parseFloat(stdout.trim()) || 0;
    } catch (error) {
      this.logger.debug('Could not get disk usage');
      return 0;
    }
  }

  private async getTemperature(): Promise<number> {
    try {
      // Try to read temperature from Raspberry Pi
      const { stdout } = await execAsync(
        "cat /sys/class/thermal/thermal_zone0/temp"
      );
      const temp = parseInt(stdout.trim(), 10) / 1000;
      return temp;
    } catch (error) {
      this.logger.debug('Could not get temperature');
      return 0;
    }
  }

  private async checkForAlerts(metrics: HealthMetrics): Promise<void> {
    const alerts: HealthAlert[] = [];

    // CPU usage alert
    if (metrics.cpuUsage > 80) {
      alerts.push({
        id: `cpu_${Date.now()}`,
        timestamp: Date.now(),
        severity: metrics.cpuUsage > 95 ? 'critical' : 'warning',
        component: 'cpu',
        message: `CPU usage is high: ${metrics.cpuUsage.toFixed(1)}%`,
        resolved: false,
      });
    }

    // Memory usage alert
    if (metrics.memoryUsage > 85) {
      alerts.push({
        id: `memory_${Date.now()}`,
        timestamp: Date.now(),
        severity: metrics.memoryUsage > 95 ? 'critical' : 'warning',
        component: 'memory',
        message: `Memory usage is high: ${metrics.memoryUsage.toFixed(1)}%`,
        resolved: false,
      });
    }

    // Disk usage alert
    if (metrics.diskUsage > 85) {
      alerts.push({
        id: `disk_${Date.now()}`,
        timestamp: Date.now(),
        severity: metrics.diskUsage > 95 ? 'critical' : 'warning',
        component: 'disk',
        message: `Disk usage is high: ${metrics.diskUsage.toFixed(1)}%`,
        resolved: false,
      });
    }

    // Temperature alert (Raspberry Pi typically throttles at 80°C)
    if (metrics.temperature > 75) {
      alerts.push({
        id: `temp_${Date.now()}`,
        timestamp: Date.now(),
        severity: metrics.temperature > 85 ? 'critical' : 'warning',
        component: 'temperature',
        message: `Temperature is high: ${metrics.temperature.toFixed(1)}°C`,
        resolved: false,
      });
    }

    // Component status alerts
    for (const [component, status] of Object.entries(metrics.componentStatus)) {
      if (status === 'error') {
        alerts.push({
          id: `component_${component}_${Date.now()}`,
          timestamp: Date.now(),
          severity: 'critical',
          component,
          message: `Component ${component} is in error state`,
          resolved: false,
        });
      }
    }

    // Store alerts
    if (alerts.length > 0) {
      this.alerts.push(...alerts);

      // Trim alerts history
      if (this.alerts.length > this.maxAlerts) {
        this.alerts = this.alerts.slice(-this.maxAlerts);
      }

      // Emit alerts
      for (const alert of alerts) {
        this.logger.warn(alert, 'Health alert');
        this.emit('health:alert', alert);
      }
    }
  }

  getMetrics(limit: number = 100): HealthMetrics[] {
    return this.metrics.slice(-limit);
  }

  getLatestMetrics(): HealthMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getAlerts(limit: number = 50): HealthAlert[] {
    return this.alerts.slice(-limit);
  }

  getCriticalAlerts(): HealthAlert[] {
    return this.alerts.filter((a) => a.severity === 'critical' && !a.resolved);
  }

  async generateHealthReport(): Promise<string> {
    const latest = this.getLatestMetrics();
    const criticalAlerts = this.getCriticalAlerts();
    const status = this.runtime.getStatus();

    const report = `
WISE² Edge Appliance Health Report
Generated: ${new Date().toISOString()}
Node ID: ${status.nodeId}
Status: ${status.status}
Uptime: ${(status.uptime / 1000 / 60 / 60).toFixed(2)} hours

System Metrics:
- CPU Usage: ${latest?.cpuUsage.toFixed(1)}%
- Memory Usage: ${latest?.memoryUsage.toFixed(1)}%
- Disk Usage: ${latest?.diskUsage.toFixed(1)}%
- Temperature: ${latest?.temperature.toFixed(1)}°C

Component Status:
${Object.entries(status.components)
  .map(([component, status]) => `- ${component}: ${status}`)
  .join('\n')}

Connectivity:
- Cloud: ${status.connectivity.cloud ? 'Connected' : 'Disconnected'}
- Local Network: ${status.connectivity.localNetwork ? 'Connected' : 'Disconnected'}
- VPN: ${status.connectivity.vpn ? 'Connected' : 'Disconnected'}

Last Sync: ${new Date(status.lastSync).toISOString()}
Pending Sync Items: ${status.pendingSync}

Critical Alerts: ${criticalAlerts.length}
${criticalAlerts.map((a) => `- [${a.timestamp}] ${a.component}: ${a.message}`).join('\n')}
    `.trim();

    return report;
  }

  setCheckInterval(intervalMs: number): void {
    this.checkIntervalMs = intervalMs;

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.startHealthChecks();
    }

    this.logger.info(
      { intervalMs },
      'Health check interval updated'
    );
  }

  async shutdown(): Promise<void> {
    try {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      this.initialized = false;
      this.logger.info('HealthMonitor shut down');
    } catch (error) {
      this.logger.error(error, 'Error during HealthMonitor shutdown');
      throw error;
    }
  }
}
