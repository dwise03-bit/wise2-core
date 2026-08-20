import pino from 'pino';

export interface DefenseIncident {
  id: string;
  type: 'police' | 'fire' | 'ems' | 'traffic' | 'weather' | 'radio' | 'mesh';
  distance: number;
  location: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
}

export interface DefenseSystemHealth {
  cpu: number; // 0-100%
  memory: number; // 0-100%
  disk: number; // 0-100%
  temperature: number; // °C
  uptime: number; // seconds
  network: {
    connected: boolean;
    signal: number; // 0-100%
  };
}

export interface DefenseImpData {
  timestamp: number;
  deviceId: string;
  incidents: {
    total: number;
    recent: DefenseIncident[]; // Last 3-5 incidents
  };
  alerts: string[]; // Recent alert messages (max 5)
  health: DefenseSystemHealth;
  connectivity: {
    wifi: boolean;
    mesh: boolean;
    sdr: boolean;
    usb: boolean;
  };
}

/**
 * Provides Defense IMP data for K10 device display.
 * Aggregates incidents, system health, and connectivity status.
 */
export class DefenseImpDataProvider {
  private logger: pino.Logger;
  private incidents: DefenseIncident[] = [];
  private alerts: string[] = [];
  private lastUpdate: number = 0;

  constructor() {
    this.logger = pino({ name: 'DefenseImpDataProvider' });
  }

  /**
   * Get current Defense IMP data for K10 display
   */
  async getData(): Promise<DefenseImpData> {
    const health = await this.getSystemHealth();
    const recentIncidents = this.incidents.slice(0, 5);
    const recentAlerts = this.alerts.slice(0, 5);

    return {
      timestamp: Date.now(),
      deviceId: process.env.NODE_ID || 'k10-01',
      incidents: {
        total: this.incidents.length,
        recent: recentIncidents,
      },
      alerts: recentAlerts,
      health,
      connectivity: {
        wifi: process.env.WIFI_CONNECTED === 'true',
        mesh: process.env.MESH_CONNECTED === 'true',
        sdr: process.env.SDR_ENABLED === 'true',
        usb: process.env.USB_CONNECTED === 'true',
      },
    };
  }

  /**
   * Add new incident from incoming radio/mesh data
   */
  addIncident(incident: DefenseIncident): void {
    this.incidents.unshift(incident);
    // Keep last 50 incidents
    if (this.incidents.length > 50) {
      this.incidents.pop();
    }
    this.logger.info({ incident }, 'Incident received');
  }

  /**
   * Add alert message
   */
  addAlert(message: string): void {
    this.alerts.unshift(`${new Date().toISOString().split('T')[1].substring(0, 5)} - ${message}`);
    // Keep last 20 alerts
    if (this.alerts.length > 20) {
      this.alerts.pop();
    }
    this.logger.warn({ message }, 'Alert received');
  }

  /**
   * Get system health metrics
   */
  private async getSystemHealth(): Promise<DefenseSystemHealth> {
    try {
      // In a real implementation, read from /proc on Linux or system APIs
      // For now, return mock data. This would be populated by HealthMonitor
      return {
        cpu: this.getCPUUsage(),
        memory: this.getMemoryUsage(),
        disk: this.getDiskUsage(),
        temperature: this.getTemperature(),
        uptime: process.uptime(),
        network: {
          connected: process.env.WIFI_CONNECTED === 'true' || process.env.MESH_CONNECTED === 'true',
          signal: this.getSignalStrength(),
        },
      };
    } catch (error) {
      this.logger.error(error, 'Error getting system health');
      return {
        cpu: 0,
        memory: 0,
        disk: 0,
        temperature: 0,
        uptime: process.uptime(),
        network: { connected: false, signal: 0 },
      };
    }
  }

  private getCPUUsage(): number {
    // Placeholder: return random value between 10-50
    return Math.floor(Math.random() * 40) + 10;
  }

  private getMemoryUsage(): number {
    // Placeholder: return random value between 20-60
    return Math.floor(Math.random() * 40) + 20;
  }

  private getDiskUsage(): number {
    // Placeholder: return random value between 30-70
    return Math.floor(Math.random() * 40) + 30;
  }

  private getTemperature(): number {
    // Placeholder: return realistic temperature between 35-60°C
    return Math.floor(Math.random() * 25) + 35;
  }

  private getSignalStrength(): number {
    // Placeholder: return RSSI-like value between -30 to -90 dBm mapped to 0-100
    const rssi = Math.floor(Math.random() * 60) - 90;
    const signal = Math.max(0, Math.min(100, (rssi + 90) * 2));
    return signal;
  }

  /**
   * Clear old data periodically
   */
  async cleanup(): Promise<void> {
    const oneHourAgo = Date.now() - 3600000;
    this.incidents = this.incidents.filter((inc) => inc.timestamp > oneHourAgo);
    this.logger.info('Cleanup completed');
  }
}
