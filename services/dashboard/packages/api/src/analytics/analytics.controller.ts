import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AnalyticsService } from './analytics.service';

@Controller('v1/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  async trackEvent(@Request() req: any, @Body() dto: any) {
    return await this.analyticsService.trackEvent(req.user.userId, dto.event_type, dto.data);
  }

  @Get('user')
  async getUserAnalytics(@Request() req: any) {
    return await this.analyticsService.getUserAnalytics(req.user.userId, new Date(), new Date());
  }

  @Get('project/:projectId')
  async getProjectAnalytics(@Query('projectId') projectId: string) {
    return await this.analyticsService.getProjectAnalytics(projectId);
  }

  @Get('dashboard')
  async getDashboardMetrics() {
    return await this.analyticsService.getDashboardMetrics();
  }
}
