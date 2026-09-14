import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { RayBanService } from './rayban.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('rayban')
export class RayBanController {
  constructor(private rayBanService: RayBanService) {}

  // Device Management
  @Post('devices/register')
  @UseGuards(JwtAuthGuard)
  async registerDevice(
    @Req() req: Request & { user: any },
    @Body() body: { deviceId: string; name?: string }
  ) {
    return this.rayBanService.registerDevice(req.user.id, body.deviceId);
  }

  @Get('devices')
  @UseGuards(JwtAuthGuard)
  async listDevices(@Req() req: Request & { user: any }) {
    return this.rayBanService.listDevices(req.user.id);
  }

  @Get('devices/:deviceId')
  async getDevice(@Param('deviceId') deviceId: string) {
    return this.rayBanService.getDevice(deviceId);
  }

  @Post('devices/:deviceId/status')
  async updateDeviceStatus(
    @Param('deviceId') deviceId: string,
    @Body() body: { status: 'connected' | 'disconnected' | 'processing'; battery?: number; location?: any }
  ) {
    return this.rayBanService.updateDeviceStatus(
      deviceId,
      body.status,
      body.battery,
      body.location
    );
  }

  // Capture Management
  @Post('captures')
  async createCapture(
    @Body() body: { deviceId: string; type: 'video' | 'audio' | 'image'; data: Buffer }
  ) {
    return this.rayBanService.createCapture(body.deviceId, body.type, body.data);
  }

  @Get('captures')
  async listCaptures(
    @Query('deviceId') deviceId: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0
  ) {
    return this.rayBanService.listCaptures(deviceId, limit, offset);
  }

  @Get('captures/:captureId')
  async getCapture(@Param('captureId') captureId: string) {
    return this.rayBanService.getCapture(captureId);
  }

  // Command Execution
  @Post('commands/send')
  async sendCommand(
    @Body() body: { deviceId: string; command: string; parameters?: any }
  ) {
    return this.rayBanService.sendCommand(body.deviceId, body.command, body.parameters);
  }

  @Get('commands/:commandId')
  async getCommand(@Param('commandId') commandId: string) {
    return this.rayBanService.getCommand(commandId);
  }

  @Post('commands/:commandId/status')
  async updateCommandStatus(
    @Param('commandId') commandId: string,
    @Body() body: { status: 'pending' | 'executing' | 'completed' | 'failed'; result?: any }
  ) {
    return this.rayBanService.updateCommandStatus(commandId, body.status, body.result);
  }

  // Hermes Integration
  @Post('captures/:captureId/analyze')
  async processWithHermes(
    @Param('captureId') captureId: string,
    @Body() body: { analysisType: string }
  ) {
    return this.rayBanService.processWithHermes(captureId, body.analysisType);
  }

  // Analytics
  @Post('analytics/:deviceId')
  async recordAnalytics(
    @Param('deviceId') deviceId: string,
    @Body() body: { metric: string; value: any }
  ) {
    await this.rayBanService.recordAnalytics(deviceId, body.metric, body.value);
    return { success: true };
  }

  @Get('analytics/:deviceId')
  async getAnalytics(
    @Param('deviceId') deviceId: string,
    @Query('metric') metric?: string
  ) {
    return this.rayBanService.getAnalytics(deviceId, metric);
  }

  // Health Check
  @Get('health')
  async health() {
    return {
      status: 'ok',
      service: 'ray-ban-integration',
      timestamp: new Date(),
      version: '1.0.0',
    };
  }
}
