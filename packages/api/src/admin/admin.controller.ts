import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('projects')
  async getProjectsForReview() {
    return await this.adminService.getProjectsForReview();
  }

  @Patch('projects/:id/approve')
  async approveProject(@Param('id') projectId: string) {
    return await this.adminService.approveProject(projectId);
  }

  @Patch('projects/:id/reject')
  async rejectProject(@Param('id') projectId: string, @Body() data: { reason?: string }) {
    return await this.adminService.rejectProject(projectId, data.reason);
  }

  @Get('stats')
  async getStats() {
    return await this.adminService.getStats();
  }
}
