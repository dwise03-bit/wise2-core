import { Controller, Post, Get, Patch, Param, Body, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { HvacTroubleshooterService } from './hvac-troubleshooter.service';

@Controller('field-tech/hvac')
export class HvacTroubleshooterController {
  constructor(private readonly service: HvacTroubleshooterService) {}

  // ===== DEVICE ENDPOINTS =====

  @Post('device/register')
  async registerDevice(
    @Body()
    body: {
      deviceId: string;
      name: string;
      technicianId?: string;
      firmwareVersion?: string;
    },
  ) {
    return this.service.registerDevice(body);
  }

  @Get('device/:deviceId')
  async getDevice(@Param('deviceId') deviceId: string) {
    return this.service.getDevice(deviceId);
  }

  @Patch('device/:deviceId/status')
  async updateDeviceStatus(@Param('deviceId') deviceId: string, @Body() body: any) {
    return this.service.updateDeviceStatus(deviceId, body);
  }

  @Post('device/:deviceId/sync')
  async syncDevice(
    @Param('deviceId') deviceId: string,
    @Body() body: { wifiStrength?: number },
  ) {
    return this.service.syncDeviceOnline(deviceId, body.wifiStrength);
  }

  // ===== READING ENDPOINTS =====

  @Post('reading')
  async createReading(
    @Body()
    body: {
      deviceId: string;
      temperatureF: number;
      humidityPercent: number;
      highSidePressurePsi: number;
      lowSidePressurePsi?: number;
      differentialPressureH2o?: number;
      supplyCelsiusF?: number;
      returnCelsiusF?: number;
      voltage?: number;
      amperage?: number;
      signalStrength?: number;
      batteryLevel?: number;
      notes?: string;
    },
  ) {
    const reading = await this.service.createReading(body);

    // Update device health based on reading
    await this.service.updateHealthStatus(body.deviceId, reading);

    return reading;
  }

  @Get('readings/:jobId')
  async getReadingsForJob(
    @Param('jobId') jobId: string,
    @Query('limit') limit: string = '100',
  ) {
    return this.service.getReadingsForJob(jobId, parseInt(limit));
  }

  @Get('device/:deviceId/readings')
  async getDeviceReadings(
    @Param('deviceId') deviceId: string,
    @Query('limit') limit: string = '100',
    @Query('offset') offset: string = '0',
  ) {
    return this.service.getReadings(deviceId, parseInt(limit), parseInt(offset));
  }

  @Get('device/:deviceId/latest')
  async getLatestReading(@Param('deviceId') deviceId: string) {
    return this.service.getLatestReading(deviceId);
  }

  @Post('readings/sync')
  async markReadingsSynced(
    @Body() body: { deviceId: string; readingIds: string[] },
  ) {
    return this.service.markReadingsSynced(body.deviceId, body.readingIds);
  }

  // ===== JOB CONTEXT =====

  @Get('job-context/:jobId')
  async getJobContext(@Param('jobId') jobId: string) {
    // This would typically fetch from WISE² Contractor OS
    // For now, return the readings linked to this job
    const readings = await this.service.getReadingsForJob(jobId, 1);
    return {
      jobId,
      lastReading: readings[0] || null,
      readingCount: readings.length,
    };
  }

  // ===== EXPORT =====

  @Get('export/:deviceId/csv')
  async exportReadingsCSV(
    @Param('deviceId') deviceId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const csv = await this.service.exportReadingsToCSV(
      deviceId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    if (res) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="hvac-readings-${deviceId}-${new Date().toISOString()}.csv"`,
      );
      return res.send(csv);
    }

    return { csv };
  }

  // ===== CALIBRATION =====

  @Post('device/:deviceId/calibration/start')
  async startCalibration(
    @Param('deviceId') deviceId: string,
    @Body() body?: { notes?: string },
  ) {
    return this.service.startCalibration(deviceId, body?.notes);
  }

  @Post('device/:deviceId/calibration/complete')
  async completeCalibration(@Param('deviceId') deviceId: string) {
    return this.service.completeCalibration(deviceId);
  }
}
