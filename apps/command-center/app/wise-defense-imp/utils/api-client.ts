import { WISE_DEFENSE_API_CONFIG } from '../config/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: 'success' | 'error' | 'offline';
  timestamp: number;
}

export interface SystemStatus {
  cpu: number;
  memory: number;
  temperature: number;
  disk: number;
  uptime: number;
}

export interface HardwareStatus {
  sdr: 'ACTIVE' | 'DETECTED_NOT_CONFIGURED' | 'MISSING_CREDENTIAL' | 'MISSING_HARDWARE' | 'DISABLED' | 'OFFLINE';
  mesh: 'ACTIVE' | 'DETECTED_NOT_CONFIGURED' | 'MISSING_CREDENTIAL' | 'MISSING_HARDWARE' | 'DISABLED' | 'OFFLINE';
  gps: 'ACTIVE' | 'OFFLINE' | 'DISABLED';
  wise2: 'CONNECTED' | 'CONNECTING' | 'OFFLINE';
}

export interface Incident {
  id: string;
  category: 'POLICE' | 'FIRE' | 'EMS' | 'TRAFFIC' | 'WEATHER' | 'PUBLIC_SAFETY';
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  distance: number;
  severity: 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';
  timestamp: number;
  source: string;
}

export interface MeshNode {
  id: string;
  name: string;
  battery: number;
  rssi: number;
  snr: number;
  lastSeen: number;
  latitude?: number;
  longitude?: number;
}

export interface Alert {
  id: string;
  level: 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export interface SdrStatus {
  connected: boolean;
  device?: string;
  frequency: number;
  sampleRate: number;
  signalLevel: number;
  recording: boolean;
}

class WiseDefenseApiClient {
  private baseUrl: string;
  private isOnline = true;

  constructor() {
    this.baseUrl = WISE_DEFENSE_API_CONFIG.baseUrl;
  }

  private async fetchWithFallback<T>(
    endpoint: string,
    init?: RequestInit,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const signal = AbortSignal.timeout(WISE_DEFENSE_API_CONFIG.timeouts.default);

    try {
      const response = await fetch(url, { ...init, signal });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      this.isOnline = true;

      return {
        data,
        status: 'success',
        timestamp: Date.now(),
      };
    } catch (error) {
      this.isOnline = false;
      console.error(`API Error: ${endpoint}`, error);

      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'offline',
        timestamp: Date.now(),
      };
    }
  }

  async getStatus(): Promise<ApiResponse<any>> {
    return this.fetchWithFallback(WISE_DEFENSE_API_CONFIG.endpoints.status);
  }

  async getSystem(): Promise<ApiResponse<SystemStatus>> {
    return this.fetchWithFallback(WISE_DEFENSE_API_CONFIG.endpoints.system);
  }

  async getHardwareStatus(): Promise<ApiResponse<HardwareStatus>> {
    return this.fetchWithFallback(WISE_DEFENSE_API_CONFIG.endpoints.health);
  }

  async getIncidents(): Promise<ApiResponse<Incident[]>> {
    return this.fetchWithFallback(WISE_DEFENSE_API_CONFIG.endpoints.incidents);
  }

  async getRecentIncidents(): Promise<ApiResponse<Incident[]>> {
    return this.fetchWithFallback(WISE_DEFENSE_API_CONFIG.endpoints.recentIncidents);
  }

  async getAlerts(): Promise<ApiResponse<Alert[]>> {
    return this.fetchWithFallback(WISE_DEFENSE_API_CONFIG.endpoints.alerts);
  }

  async getMeshNodes(): Promise<ApiResponse<MeshNode[]>> {
    return this.fetchWithFallback(WISE_DEFENSE_API_CONFIG.endpoints.meshNodes);
  }

  async getSdrStatus(): Promise<ApiResponse<SdrStatus>> {
    return this.fetchWithFallback(WISE_DEFENSE_API_CONFIG.endpoints.sdrStatus);
  }

  async getSitrep(): Promise<ApiResponse<any>> {
    return this.fetchWithFallback(WISE_DEFENSE_API_CONFIG.endpoints.sitrep);
  }

  async chatWithImp(message: string): Promise<ApiResponse<{ response: string }>> {
    return this.fetchWithFallback(
      WISE_DEFENSE_API_CONFIG.endpoints.impChat,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      },
    );
  }

  isConnected(): boolean {
    return this.isOnline;
  }
}

export const apiClient = new WiseDefenseApiClient();
