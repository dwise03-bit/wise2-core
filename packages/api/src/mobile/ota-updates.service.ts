import { Injectable, Logger } from '@nestjs/common';

interface DeviceVersion {
  device: string;
  currentVersion: string;
  lastCheckTime: number;
}

interface UpdateManifest {
  versionCode: number;
  versionName: string;
  releaseDate: string;
  downloadUrl: string;
  size: number; // bytes
  hash: string; // SHA256 for verification
  minVersionCode: number; // Minimum version to update from
  changelog: string;
  critical: boolean; // Force update if true
  rolloutPercentage: number; // 0-100 for staged rollout
}

interface UpdateCheckResult {
  updateAvailable: boolean;
  version?: UpdateManifest;
  delayDays?: number; // For staged rollouts
}

/**
 * OTA (Over-The-Air) Updates Service
 * Manages APK versioning and deployment
 * Supports:
 * - Delta updates (reduced bandwidth)
 * - Staged rollouts (canary deployments)
 * - Rollback capability
 * - Device-specific updates
 */
@Injectable()
export class OTAUpdatesService {
  private readonly logger = new Logger('OTAUpdatesService');

  // Version manifests - in production, load from database
  private versions: Map<string, UpdateManifest[]> = new Map([
    [
      'razr',
      [
        {
          versionCode: 101,
          versionName: '1.0.1',
          releaseDate: '2024-09-14',
          downloadUrl: 'https://wise2.net/api/mobile/apk/wise2-1.0.1-razr.apk',
          size: 45000000, // 45MB
          hash: 'abc123def456', // SHA256
          minVersionCode: 100,
          changelog: 'Bug fixes: tools integration, OTA updates, UI menu',
          critical: false,
          rolloutPercentage: 100,
        },
        {
          versionCode: 100,
          versionName: '1.0.0',
          releaseDate: '2024-09-13',
          downloadUrl: 'https://wise2.net/api/mobile/apk/wise2-1.0.0-razr.apk',
          size: 50000000, // 50MB
          hash: 'abc123def455',
          minVersionCode: 0,
          changelog: 'Initial release',
          critical: false,
          rolloutPercentage: 100,
        },
      ],
    ],
  ]);

  // Device checksums - track what's deployed
  private deviceState: Map<string, DeviceVersion> = new Map();

  /**
   * Check if device needs an update
   * Implements staged rollout (don't push to everyone at once)
   */
  async checkForUpdate(device: string, currentVersionCode: number): Promise<UpdateCheckResult> {
    const versions = this.versions.get(device.toLowerCase());

    if (!versions || versions.length === 0) {
      this.logger.warn(`No versions available for device: ${device}`);
      return { updateAvailable: false };
    }

    const latestVersion = versions[0]; // Most recent first

    if (latestVersion.versionCode <= currentVersionCode) {
      return { updateAvailable: false };
    }

    // Check if device should get this update (staged rollout)
    if (latestVersion.rolloutPercentage < 100) {
      const deviceHash = this.hashDevice(device);
      const rolloutBucket = (deviceHash % 100) + 1; // 1-100

      if (rolloutBucket > latestVersion.rolloutPercentage) {
        // This device hasn't been selected yet
        const delayDays = Math.ceil((100 - latestVersion.rolloutPercentage) / 10);
        return {
          updateAvailable: false,
          delayDays,
        };
      }
    }

    this.logger.log(
      `Update available for ${device}: ${latestVersion.versionName} (from ${currentVersionCode} to ${latestVersion.versionCode})`
    );

    return {
      updateAvailable: true,
      version: latestVersion,
    };
  }

  /**
   * Get delta (incremental) update for bandwidth optimization
   * Downloads only changed files instead of full APK
   */
  async getDeltaUpdate(
    device: string,
    fromVersionCode: number,
    toVersionCode: number
  ): Promise<{ deltaUrl: string; size: number; type: 'full' | 'delta' }> {
    const versions = this.versions.get(device.toLowerCase());

    if (!versions) {
      throw new Error(`Device not found: ${device}`);
    }

    const toVersion = versions.find(v => v.versionCode === toVersionCode);

    if (!toVersion) {
      throw new Error(`Version not found: ${toVersionCode}`);
    }

    // Check if delta is available
    const deltaSize = Math.ceil(toVersion.size * 0.1); // Assume 10% of full size
    const hasDelta = toVersionCode - fromVersionCode <= 3 && fromVersionCode >= toVersion.minVersionCode;

    if (hasDelta && deltaSize < toVersion.size * 0.7) {
      return {
        deltaUrl: `https://wise2.net/api/mobile/delta/${device}/${fromVersionCode}-${toVersionCode}.delta`,
        size: deltaSize,
        type: 'delta',
      };
    }

    // Fall back to full APK
    return {
      deltaUrl: toVersion.downloadUrl,
      size: toVersion.size,
      type: 'full',
    };
  }

  /**
   * Report update status (success/failure)
   * Used for analytics and rollback decisions
   */
  async reportUpdateStatus(
    device: string,
    versionCode: number,
    success: boolean,
    error?: string
  ): Promise<void> {
    const key = `${device}-${versionCode}`;

    if (success) {
      this.logger.log(`Update successful on ${device}: version ${versionCode}`);
      this.deviceState.set(key, {
        device,
        currentVersion: versionCode.toString(),
        lastCheckTime: Date.now(),
      });
    } else {
      this.logger.error(`Update failed on ${device}: ${error}`);
      // Trigger rollback or degraded mode
      await this.handleUpdateFailure(device, versionCode);
    }
  }

  /**
   * Rollback to previous version if needed
   */
  async rollback(device: string, toVersionCode: number): Promise<UpdateManifest> {
    const versions = this.versions.get(device.toLowerCase());

    if (!versions) {
      throw new Error(`Device not found: ${device}`);
    }

    const targetVersion = versions.find(v => v.versionCode === toVersionCode);

    if (!targetVersion) {
      throw new Error(`Version not found: ${toVersionCode}`);
    }

    this.logger.log(`Rolling back ${device} to version ${toVersionCode}`);
    return targetVersion;
  }

  /**
   * Add new version (deployment)
   */
  async deployVersion(device: string, version: UpdateManifest): Promise<void> {
    const versions = this.versions.get(device.toLowerCase()) || [];

    // Insert in reverse chronological order (newest first)
    versions.unshift(version);
    this.versions.set(device.toLowerCase(), versions);

    this.logger.log(
      `Deployed version ${version.versionName} for ${device} (rollout: ${version.rolloutPercentage}%)`
    );
  }

  /**
   * Get deployment status across devices
   */
  async getDeploymentStatus(device: string): Promise<{
    latestVersion: UpdateManifest | null;
    deviceCount: number;
    rolloutPercentage: number;
    estimatedDevicesReached: number;
  }> {
    const versions = this.versions.get(device.toLowerCase());
    const latestVersion = versions?.[0] || null;

    // Estimate based on recorded device states (in production, query database)
    const devicesReached = Array.from(this.deviceState.values()).filter(
      d => d.device.toLowerCase() === device.toLowerCase()
    ).length;

    return {
      latestVersion,
      deviceCount: devicesReached,
      rolloutPercentage: latestVersion?.rolloutPercentage || 0,
      estimatedDevicesReached: Math.ceil(
        devicesReached * (latestVersion?.rolloutPercentage || 0) / 100
      ),
    };
  }

  /**
   * Private helpers
   */
  private hashDevice(device: string): number {
    let hash = 0;
    for (let i = 0; i < device.length; i++) {
      const char = device.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private async handleUpdateFailure(device: string, versionCode: number): Promise<void> {
    // In production:
    // 1. Log to monitoring
    // 2. If X% of devices fail, halt rollout
    // 3. Trigger automatic rollback
    // 4. Alert ops team
    this.logger.error(`Update failure on ${device} v${versionCode} - initiating rollback checks`);
  }
}
