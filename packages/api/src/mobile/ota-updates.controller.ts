import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { OTAUpdatesService } from './ota-updates.service';

interface UpdateCheckRequest {
  device: string; // 'razr', 'galaxy', 'pixel'
  versionCode: number;
  platform?: string; // 'android', 'ios'
}

interface UpdateReportRequest {
  device: string;
  versionCode: number;
  success: boolean;
  error?: string;
  installDurationMs?: number;
  errorLog?: string;
}

/**
 * Mobile OTA Updates API
 * Endpoints for APK update management
 */
@Controller('api/v1/mobile/updates')
export class OTAUpdatesController {
  private readonly logger = new Logger('OTAUpdatesController');

  constructor(private otaService: OTAUpdatesService) {}

  /**
   * Check if update is available for device
   * GET /api/v1/mobile/updates/check?device=razr&versionCode=100
   */
  @Get('check')
  @HttpCode(HttpStatus.OK)
  async checkForUpdate(@Query('device') device: string, @Query('versionCode') versionCodeStr: string) {
    const versionCode = parseInt(versionCodeStr, 10);

    if (!device || isNaN(versionCode)) {
      return {
        success: false,
        error: 'Missing or invalid device/versionCode parameters',
      };
    }

    try {
      const result = await this.otaService.checkForUpdate(device, versionCode);

      return {
        success: true,
        updateAvailable: result.updateAvailable,
        version: result.version ? {
          versionCode: result.version.versionCode,
          versionName: result.version.versionName,
          changelog: result.version.changelog,
          critical: result.version.critical,
          size: result.version.size,
        } : null,
        delayDays: result.delayDays,
      };
    } catch (error) {
      this.logger.error(`Check failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get delta (incremental) update for bandwidth optimization
   * GET /api/v1/mobile/updates/delta?device=razr&from=100&to=101
   */
  @Get('delta')
  @HttpCode(HttpStatus.OK)
  async getDeltaUpdate(
    @Query('device') device: string,
    @Query('from') fromStr: string,
    @Query('to') toStr: string
  ) {
    const fromVersion = parseInt(fromStr, 10);
    const toVersion = parseInt(toStr, 10);

    if (!device || isNaN(fromVersion) || isNaN(toVersion)) {
      return {
        success: false,
        error: 'Missing or invalid parameters',
      };
    }

    try {
      const result = await this.otaService.getDeltaUpdate(device, fromVersion, toVersion);

      return {
        success: true,
        updateType: result.type,
        downloadUrl: result.deltaUrl,
        size: result.size,
        estimatedDownloadTimeSeconds: Math.ceil(result.size / (1024 * 1024 * 5)), // Assume 5MB/s
      };
    } catch (error) {
      this.logger.error(`Delta lookup failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Report update installation status
   * POST /api/v1/mobile/updates/report
   */
  @Post('report')
  @HttpCode(HttpStatus.OK)
  async reportUpdateStatus(@Body() req: UpdateReportRequest) {
    const { device, versionCode, success, error, installDurationMs } = req;

    if (!device || versionCode === undefined || success === undefined) {
      return {
        success: false,
        error: 'Missing required fields: device, versionCode, success',
      };
    }

    try {
      await this.otaService.reportUpdateStatus(device, versionCode, success, error);

      const logMessage = success
        ? `✓ Update v${versionCode} on ${device} (${installDurationMs}ms)`
        : `✗ Update v${versionCode} on ${device} failed: ${error}`;

      this.logger.log(logMessage);

      return {
        success: true,
        message: logMessage,
        nextAction: success ? 'none' : 'rollback_available',
      };
    } catch (err) {
      this.logger.error(`Report failed: ${err instanceof Error ? err.message : String(err)}`);
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Rollback to previous version
   * POST /api/v1/mobile/updates/rollback
   */
  @Post('rollback')
  @HttpCode(HttpStatus.OK)
  async rollback(
    @Body() req: { device: string; toVersionCode: number }
  ) {
    const { device, toVersionCode } = req;

    if (!device || toVersionCode === undefined) {
      return {
        success: false,
        error: 'Missing device or toVersionCode',
      };
    }

    try {
      const version = await this.otaService.rollback(device, toVersionCode);

      return {
        success: true,
        message: `Rollback to ${version.versionName}`,
        downloadUrl: version.downloadUrl,
        size: version.size,
      };
    } catch (error) {
      this.logger.error(`Rollback failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get deployment status
   * GET /api/v1/mobile/updates/status?device=razr
   */
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus(@Query('device') device: string) {
    if (!device) {
      return {
        success: false,
        error: 'Missing device parameter',
      };
    }

    try {
      const status = await this.otaService.getDeploymentStatus(device);

      return {
        success: true,
        latestVersion: status.latestVersion?.versionName,
        latestVersionCode: status.latestVersion?.versionCode,
        rolloutPercentage: status.latestVersion?.rolloutPercentage || 0,
        devicesReached: status.estimatedDevicesReached,
        changelog: status.latestVersion?.changelog,
      };
    } catch (error) {
      this.logger.error(`Status lookup failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return {
      status: 'ok',
      service: 'ota-updates',
      timestamp: new Date().toISOString(),
    };
  }
}
