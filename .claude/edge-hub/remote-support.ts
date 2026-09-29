/**
 * WISE² Edge Hub - Remote Support
 *
 * Generates support bundles for remote troubleshooting:
 * - System logs (systemd, PM2)
 * - Device diagnostics
 * - MQTT message capture
 * - Audio diagnostics
 * - Performance metrics
 *
 * Redacts secrets before export.
 */

import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import { createWriteStream } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import { createGzip } from 'zlib';
import { DeviceRegistry } from './device-registry';
import { BluetoothManager } from './bluetooth-manager';

const execAsync = promisify(exec);

export interface SupportBundle {
  timestamp: number;
  hostname: string;
  size: number;
  path: string;
  redacted: boolean;
  summary: Record<string, any>;
}

export class RemoteSupport {
  constructor(
    private registry: DeviceRegistry,
    private bluetoothManager: BluetoothManager,
    private bundleDir: string = '/home/dwise/wise2-edge/data/support-bundles'
  ) {}

  /**
   * Generate comprehensive support bundle
   */
  async generateBundle(includeSecrets: boolean = false): Promise<SupportBundle> {
    const startTime = Date.now();
    const timestamp = Date.now();
    const bundleId = `support-bundle-${timestamp}`;
    const bundlePath = path.join(this.bundleDir, bundleId);

    try {
      // Create bundle directory
      fs.mkdirSync(bundlePath, { recursive: true });

      console.log(`[Support] Generating bundle: ${bundleId}`);

      // Collect diagnostics in parallel
      const [systemInfo, serviceStatus, deviceInfo, audioInfo, logs] = await Promise.all([
        this.getSystemInfo(),
        this.getServiceStatus(),
        this.getDeviceInfo(),
        this.getAudioInfo(),
        this.collectLogs(),
      ]);

      // Write manifest
      const manifest = {
        id: bundleId,
        timestamp,
        generated_at: new Date(timestamp).toISOString(),
        hostname: systemInfo.hostname,
        redacted: !includeSecrets,
        system: systemInfo,
        services: serviceStatus,
        devices: deviceInfo,
        audio: audioInfo,
      };

      fs.writeFileSync(path.join(bundlePath, 'manifest.json'), JSON.stringify(manifest, null, 2));

      // Write logs
      for (const [name, content] of Object.entries(logs)) {
        const logFile = path.join(bundlePath, `logs-${name}.txt`);
        const redactedContent = includeSecrets ? content : this.redactSecrets(content);
        fs.writeFileSync(logFile, redactedContent);
      }

      // Write diagnostics
      fs.writeFileSync(
        path.join(bundlePath, 'diagnostics.json'),
        JSON.stringify(
          {
            system: systemInfo,
            services: serviceStatus,
            devices: deviceInfo,
            audio: audioInfo,
          },
          null,
          2
        )
      );

      // Create compressed archive
      const tarPath = await this.compressBundle(bundlePath);

      // Calculate size
      const stats = fs.statSync(tarPath);
      const size = stats.size;

      console.log(
        `[Support] Bundle ready: ${bundleId}.tar.gz (${(size / 1024).toFixed(2)} KB)`
      );

      return {
        timestamp,
        hostname: systemInfo.hostname,
        size,
        path: tarPath,
        redacted: !includeSecrets,
        summary: manifest,
      };
    } catch (err) {
      console.error('[Support] Bundle generation failed:', err);
      throw err;
    }
  }

  /**
   * Get system information
   */
  private async getSystemInfo(): Promise<Record<string, any>> {
    try {
      const hostname = execSync('hostname').toString().trim();
      const uptime = execSync('uptime').toString().trim();
      const memInfo = execSync('free -h').toString();
      const diskInfo = execSync('df -h /').toString();
      const uname = execSync('uname -a').toString().trim();

      return {
        hostname,
        uptime,
        uname,
        memory: memInfo,
        disk: diskInfo,
        timestamp: Date.now(),
      };
    } catch (err) {
      console.error('[Support] System info failed:', err);
      return { error: 'Failed to collect system info' };
    }
  }

  /**
   * Get service status
   */
  private async getServiceStatus(): Promise<Record<string, any>> {
    try {
      const services = ['mosquitto', 'nginx', 'ollama', 'bluetooth', 'pm2-dwise'];
      const status: Record<string, any> = {};

      for (const service of services) {
        try {
          const output = execSync(`systemctl status ${service} --no-pager`).toString();
          status[service] = output;
        } catch {
          status[service] = `${service} not found or not running`;
        }
      }

      // PM2 status
      try {
        const pm2Status = execSync('pm2 status').toString();
        status['pm2'] = pm2Status;
      } catch {
        status['pm2'] = 'PM2 not available';
      }

      return status;
    } catch (err) {
      console.error('[Support] Service status failed:', err);
      return { error: 'Failed to collect service status' };
    }
  }

  /**
   * Get device registry info
   */
  private async getDeviceInfo(): Promise<Record<string, any>> {
    try {
      const devices = this.registry.getAllDevices();
      return {
        registered: devices.length,
        online: devices.filter(d => d.isOnline).length,
        devices: devices.map(d => ({
          id: d.deviceId,
          type: d.deviceType,
          online: d.isOnline,
          lastSeen: new Date(d.lastSeen).toISOString(),
          heartbeats: d.heartbeatCount,
        })),
      };
    } catch (err) {
      console.error('[Support] Device info failed:', err);
      return { error: 'Failed to collect device info' };
    }
  }

  /**
   * Get audio/Bluetooth diagnostics
   */
  private async getAudioInfo(): Promise<Record<string, any>> {
    try {
      const btDiags = await this.bluetoothManager.getDiagnostics();
      const sources = execSync('pactl list sources short').toString();
      const sinks = execSync('pactl list sinks short').toString();

      return {
        bluetooth: btDiags,
        pulseaudio_sources: sources,
        pulseaudio_sinks: sinks,
      };
    } catch (err) {
      console.error('[Support] Audio info failed:', err);
      return { error: 'Failed to collect audio info' };
    }
  }

  /**
   * Collect relevant logs
   */
  private async collectLogs(): Promise<Record<string, string>> {
    const logs: Record<string, string> = {};

    try {
      // System logs
      try {
        logs['system'] = execSync('journalctl -n 100 --no-pager').toString();
      } catch {
        logs['system'] = 'System logs not available';
      }

      // MQTT logs
      try {
        logs['mosquitto'] = execSync('journalctl -u mosquitto -n 50 --no-pager').toString();
      } catch {
        logs['mosquitto'] = 'MQTT logs not available';
      }

      // Ollama logs
      try {
        logs['ollama'] = execSync('journalctl -u ollama -n 50 --no-pager').toString();
      } catch {
        logs['ollama'] = 'Ollama logs not available';
      }

      // PM2 logs
      try {
        logs['pm2-registry'] = execSync('pm2 logs wise2-edge-registry --nostream --lines 50')
          .toString();
        logs['pm2-health'] = execSync('pm2 logs wise2-edge-health --nostream --lines 50')
          .toString();
        logs['pm2-voice'] = execSync('pm2 logs wise2-edge-voice --nostream --lines 50')
          .toString();
      } catch {
        logs['pm2'] = 'PM2 logs not available';
      }

      return logs;
    } catch (err) {
      console.error('[Support] Log collection failed:', err);
      return { error: 'Failed to collect logs' };
    }
  }

  /**
   * Redact sensitive information
   */
  private redactSecrets(content: string): string {
    let redacted = content;

    // Redact common secrets
    redacted = redacted.replace(
      /password[=:]\s*"?([^"\s,}]+)/gi,
      'password=***REDACTED***'
    );
    redacted = redacted.replace(/auth[=:]\s*"?([^"\s,}]+)/gi, 'auth=***REDACTED***');
    redacted = redacted.replace(/token[=:]\s*"?([^"\s,}]+)/gi, 'token=***REDACTED***');
    redacted = redacted.replace(/secret[=:]\s*"?([^"\s,}]+)/gi, 'secret=***REDACTED***');
    redacted = redacted.replace(/apikey[=:]\s*"?([^"\s,}]+)/gi, 'apikey=***REDACTED***');
    redacted = redacted.replace(/mac[=:]\s*"?([0-9a-fA-F:]{17})/gi, 'mac=***REDACTED***');

    // Redact IPs (but keep first octet for context)
    redacted = redacted.replace(
      /(\d+)\.(\d+)\.(\d+)\.(\d+)/g,
      (match, a) => `${a}.*.*.* (REDACTED)`
    );

    return redacted;
  }

  /**
   * Compress bundle to tar.gz
   */
  private async compressBundle(bundlePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const output = `${bundlePath}.tar.gz`;
      const archive = createWriteStream(output);

      try {
        execSync(`tar -czf "${output}" -C "${path.dirname(bundlePath)}" "${path.basename(bundlePath)}"`);
        // Clean up uncompressed directory
        execSync(`rm -rf "${bundlePath}"`);
        resolve(output);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * List available bundles
   */
  listBundles(): SupportBundle[] {
    try {
      const files = fs.readdirSync(this.bundleDir).filter(f => f.endsWith('.tar.gz'));

      return files
        .map(file => {
          const fullPath = path.join(this.bundleDir, file);
          const stats = fs.statSync(fullPath);
          const match = file.match(/support-bundle-(\d+)/);
          const timestamp = match ? parseInt(match[1]) : 0;

          return {
            timestamp,
            hostname: 'unknown',
            size: stats.size,
            path: fullPath,
            redacted: true,
            summary: {},
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (err) {
      console.error('[Support] List bundles failed:', err);
      return [];
    }
  }

  /**
   * Delete bundle
   */
  deleteBundle(bundlePath: string): boolean {
    try {
      fs.unlinkSync(bundlePath);
      console.log(`[Support] Deleted bundle: ${bundlePath}`);
      return true;
    } catch (err) {
      console.error('[Support] Delete failed:', err);
      return false;
    }
  }

  /**
   * Export bundle for download (redacted by default)
   */
  async exportBundle(bundlePath: string): Promise<Buffer> {
    return fs.readFileSync(bundlePath);
  }
}

export async function createRemoteSupport(
  registry: DeviceRegistry,
  bluetoothManager: BluetoothManager
): Promise<RemoteSupport> {
  const support = new RemoteSupport(registry, bluetoothManager);
  console.log('[Support] Remote support initialized');
  return support;
}
