import axios, { AxiosInstance } from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TailscaleConfig {
  apiKey: string;
  machineName: string;
  tailnetName?: string;
}

interface TailscaleStatus {
  connected: boolean;
  machineIP?: string;
  machineID?: string;
  peers?: number;
}

export class TailscaleClient {
  private apiKey: string;
  private machineName: string;
  private tailnetName: string;
  private client: AxiosInstance;
  private connected: boolean = false;
  private machineIP: string = '';

  constructor(config: TailscaleConfig) {
    this.apiKey = config.apiKey;
    this.machineName = config.machineName;
    this.tailnetName = config.tailnetName || 'default';

    this.client = axios.create({
      baseURL: 'https://api.tailscale.com/api/v2',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async connect(): Promise<void> {
    try {
      // Check if tailscaled is running
      const { stdout } = await execAsync('tailscale status');
      console.log('Tailscale status:', stdout);

      // If not connected, attempt connection
      if (!this.connected) {
        await this.enableTailscale();
      }
    } catch (error) {
      console.error('Tailscale connection error:', error);
      throw new Error('Failed to connect to Tailscale');
    }
  }

  private async enableTailscale(): Promise<void> {
    try {
      // Start Tailscale daemon on macOS
      if (process.platform === 'darwin') {
        await execAsync('launchctl start io.tailscale.ipn.macos');
        await this.sleep(2000);
      }

      // Authenticate
      const authUrl = await this.getAuthURL();
      console.log(`Open this URL to authenticate: ${authUrl}`);

      // Wait for authentication
      await this.waitForAuthentication();

      this.connected = true;
      await this.updateMachineIP();
    } catch (error) {
      console.error('Failed to enable Tailscale:', error);
      throw error;
    }
  }

  private async getAuthURL(): Promise<string> {
    try {
      const response = await this.client.post('/tailnet/default/authorize-device', {
        authKey: this.apiKey,
      });
      return response.data.authUrl || '';
    } catch (error) {
      throw new Error('Failed to get auth URL');
    }
  }

  private async waitForAuthentication(maxAttempts: number = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const { stdout } = await execAsync('tailscale status --json');
        const status = JSON.parse(stdout);

        if (status.Self?.Online) {
          this.connected = true;
          this.machineIP = status.Self.TailscaleIPs?.[0] || '';
          return;
        }
      } catch (error) {
        // Continue polling
      }

      await this.sleep(1000);
    }

    throw new Error('Authentication timeout');
  }

  private async updateMachineIP(): Promise<void> {
    try {
      const { stdout } = await execAsync('tailscale status --json');
      const status = JSON.parse(stdout);
      this.machineIP = status.Self?.TailscaleIPs?.[0] || '';
    } catch (error) {
      console.error('Failed to update machine IP:', error);
    }
  }

  async getStatus(): Promise<TailscaleStatus> {
    try {
      const { stdout } = await execAsync('tailscale status --json');
      const status = JSON.parse(stdout);

      return {
        connected: status.Self?.Online || false,
        machineIP: status.Self?.TailscaleIPs?.[0],
        machineID: status.Self?.ID,
        peers: Object.keys(status.Peer || {}).length,
      };
    } catch (error) {
      return {
        connected: this.connected,
        machineIP: this.machineIP,
      };
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getMachineIP(): string {
    return this.machineIP;
  }

  async disconnect(): Promise<void> {
    try {
      if (process.platform === 'darwin') {
        await execAsync('launchctl stop io.tailscale.ipn.macos');
      } else {
        await execAsync('tailscale logout');
      }
      this.connected = false;
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
