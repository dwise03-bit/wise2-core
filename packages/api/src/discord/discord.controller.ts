import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { DiscordService } from './discord.service';

@Controller('v1/discord')
@UseGuards(JwtAuthGuard)
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}

  @Get('status')
  getStatus() {
    return this.discordService.getStatus();
  }

  @Get('summary')
  getSummary() {
    return this.discordService.getSummary();
  }

  @Get('setup')
  getSetup() {
    return this.discordService.getSetupStatus();
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async sendTest(
    @Body()
    body?: {
      channel?: 'alerts' | 'builds' | 'deployments' | 'decisions';
      message?: string;
    },
  ) {
    return this.discordService.sendTestNotification(
      body?.channel || 'alerts',
      body?.message,
    );
  }
}
