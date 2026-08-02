/**
 * WISE² Edge Hub - Bluetooth Manager
 *
 * Handles Bluetooth speaker connection lifecycle:
 * - Auto-reconnect on disconnect
 * - Keep-alive pings
 * - Connection state tracking
 * - Audio device discovery
 */

import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BluetoothDevice {
  address: string;
  name: string;
  paired: boolean;
  connected: boolean;
  rssi?: number;
  battery?: number;
}

export class BluetoothManager extends EventEmitter {
  private e09Address = '34:17:23:01:A5:34';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectBackoffMs = 1000;
  private keepaliveInterval: NodeJS.Timeout | null = null;
  private connectionCheckInterval: NodeJS.Timeout | null = null;
  private isConnected = false;

  constructor() {
    super();
  }

  /**
   * Initialize and connect to E09 speaker
   */
  async connect(): Promise<boolean> {
    try {
      console.log('[BT] Connecting to E09 speaker...');

      // Ensure Bluetooth is powered
      await this.ensurePowered();

      // Connect to E09
      const { stdout, stderr } = await execAsync(
        `bluetoothctl connect ${this.e09Address} 2>&1`
      );

      if (stderr && stderr.includes('Failed')) {
        throw new Error(stderr);
      }

      // Wait for connection to establish
      await this.waitForConnection(5000);

      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('[BT] Connected to E09');

      // Start keep-alive and monitoring
      this.startKeepalive();
      this.startConnectionMonitoring();

      this.emit('connected');
      return true;
    } catch (err) {
      console.error('[BT] Connection failed:', err);
      return this.attemptReconnect();
    }
  }

  /**
   * Disconnect from E09
   */
  async disconnect(): Promise<void> {
    this.stopKeepalive();
    this.stopConnectionMonitoring();

    try {
      await execAsync(`bluetoothctl disconnect ${this.e09Address}`);
      this.isConnected = false;
      console.log('[BT] Disconnected from E09');
      this.emit('disconnected');
    } catch (err) {
      console.error('[BT] Disconnect error:', err);
    }
  }

  /**
   * Check connection status
   */
  async isConnectedToE09(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `bluetoothctl info ${this.e09Address} | grep "Connected:"`
      );
      this.isConnected = stdout.includes('yes');
      return this.isConnected;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Auto-reconnect with exponential backoff
   */
  private async attemptReconnect(): Promise<boolean> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[BT] Max reconnection attempts reached');
      this.emit('reconnect-failed');
      return false;
    }

    this.reconnectAttempts++;
    const backoffMs = this.reconnectBackoffMs * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[BT] Reconnecting in ${backoffMs}ms (attempt ${this.reconnectAttempts})`);
    this.emit('reconnecting', { attempt: this.reconnectAttempts });

    await new Promise(resolve => setTimeout(resolve, backoffMs));

    return this.connect();
  }

  /**
   * Ensure Bluetooth adapter is powered
   */
  private async ensurePowered(): Promise<void> {
    try {
      const { stdout } = await execAsync('bluetoothctl show | grep "Powered:"');

      if (!stdout.includes('yes')) {
        console.log('[BT] Powering on adapter...');
        await execAsync('bluetoothctl power on');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.error('[BT] Power check failed:', err);
    }
  }

  /**
   * Wait for connection to establish
   */
  private async waitForConnection(timeoutMs: number): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const connected = await this.isConnectedToE09();
      if (connected) return;
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    throw new Error('Connection timeout');
  }

  /**
   * Start keep-alive pings (prevent E09 auto-sleep)
   */
  private startKeepalive(): void {
    if (this.keepaliveInterval) return;

    this.keepaliveInterval = setInterval(async () => {
      try {
        // Send AVDTP keep-alive ping
        await execAsync(`bluetoothctl info ${this.e09Address} > /dev/null`);
        this.emit('keepalive');
      } catch (err) {
        console.error('[BT] Keep-alive failed:', err);
      }
    }, 10000); // Every 10 seconds
  }

  /**
   * Stop keep-alive pings
   */
  private stopKeepalive(): void {
    if (this.keepaliveInterval) {
      clearInterval(this.keepaliveInterval);
      this.keepaliveInterval = null;
    }
  }

  /**
   * Start connection monitoring
   */
  private startConnectionMonitoring(): void {
    if (this.connectionCheckInterval) return;

    this.connectionCheckInterval = setInterval(async () => {
      const connected = await this.isConnectedToE09();

      if (!connected && this.isConnected) {
        console.warn('[BT] Connection lost');
        this.isConnected = false;
        this.stopKeepalive();
        this.emit('disconnected');

        // Auto-reconnect
        this.attemptReconnect();
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Stop connection monitoring
   */
  private stopConnectionMonitoring(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }

  /**
   * Get E09 device info
   */
  async getDeviceInfo(): Promise<BluetoothDevice | null> {
    try {
      const { stdout } = await execAsync(`bluetoothctl info ${this.e09Address}`);

      const nameMatch = stdout.match(/Name: (.+)/);
      const connectedMatch = stdout.match(/Connected: (.+)/);
      const pairedMatch = stdout.match(/Paired: (.+)/);
      const rssiMatch = stdout.match(/RSSI: (.+)/);

      return {
        address: this.e09Address,
        name: nameMatch ? nameMatch[1].trim() : 'Unknown',
        paired: pairedMatch ? pairedMatch[1].trim() === 'yes' : false,
        connected: connectedMatch ? connectedMatch[1].trim() === 'yes' : false,
        rssi: rssiMatch ? parseInt(rssiMatch[1]) : undefined,
      };
    } catch (err) {
      console.error('[BT] Device info error:', err);
      return null;
    }
  }

  /**
   * Check microphone availability (when E09 connected)
   */
  async getMicrophoneInfo(): Promise<{ available: boolean; device?: string; error?: string }> {
    try {
      const connected = await this.isConnectedToE09();

      if (!connected) {
        return { available: false, error: 'E09 not connected' };
      }

      // Check PulseAudio for Bluetooth mic
      const { stdout } = await execAsync('pactl list sources short | grep -i bluetooth');

      if (stdout.trim()) {
        const device = stdout.split('\t')[1]; // Extract device name
        return { available: true, device };
      }

      return { available: false, error: 'Bluetooth microphone not found in PulseAudio' };
    } catch (err) {
      return { available: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  /**
   * Check speaker availability
   */
  async getSpeakerInfo(): Promise<{ available: boolean; device?: string; error?: string }> {
    try {
      const connected = await this.isConnectedToE09();

      if (!connected) {
        return { available: false, error: 'E09 not connected' };
      }

      // Check PulseAudio for Bluetooth speaker
      const { stdout } = await execAsync('pactl list sinks short | grep -i bluetooth');

      if (stdout.trim()) {
        const device = stdout.split('\t')[1]; // Extract device name
        return { available: true, device };
      }

      return { available: false, error: 'Bluetooth speaker not found in PulseAudio' };
    } catch (err) {
      return { available: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  /**
   * Diagnostics
   */
  async getDiagnostics(): Promise<Record<string, any>> {
    const [device, mic, speaker] = await Promise.all([
      this.getDeviceInfo(),
      this.getMicrophoneInfo(),
      this.getSpeakerInfo(),
    ]);

    return {
      device,
      microphone: mic,
      speaker,
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      keepaliveActive: this.keepaliveInterval !== null,
      monitoringActive: this.connectionCheckInterval !== null,
    };
  }
}

export async function createBluetoothManager(): Promise<BluetoothManager> {
  const manager = new BluetoothManager();
  console.log('[BT] Manager initialized');
  return manager;
}
