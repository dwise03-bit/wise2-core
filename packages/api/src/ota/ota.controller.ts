import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

interface UpdateInfo {
  version: string;
  buildCode: number;
  changelog: string;
  downloadUrl: string;
  fileSize: number;
  fileName: string;
  releaseDate: string;
  isMandatory: boolean;
}

@Controller('api/ota')
export class OTAController {
  private updateManifest: Record<string, UpdateInfo> = {
    fieldtech: {
      version: '1.1.0',
      buildCode: 20260914,
      changelog: 'Fixed: Razr Bluetooth connectivity, Added: OTA auto-update, Improved: Field performance',
      downloadUrl: 'https://wise2.net/downloads/fieldtech/wise2-fieldtech-razr-latest.apk',
      fileSize: 45823456,
      fileName: 'wise2-fieldtech-razr-latest.apk',
      releaseDate: '2026-09-14',
      isMandatory: false,
    },
  };

  @Get('/check/:app')
  checkForUpdates(@Param('app') app: string, @Res() res: Response) {
    const update = this.updateManifest[app.toLowerCase()];

    if (!update) {
      return res.status(404).json({ error: 'App not found' });
    }

    return res.json({
      hasUpdate: true,
      ...update,
      timestamp: new Date().toISOString(),
    });
  }

  @Get('/manifest/:app')
  getManifest(@Param('app') app: string) {
    return this.updateManifest[app.toLowerCase()] || { error: 'App not found' };
  }

  @Get('/status')
  getStatus() {
    return {
      status: 'operational',
      apps: Object.keys(this.updateManifest),
      timestamp: new Date().toISOString(),
    };
  }
}
