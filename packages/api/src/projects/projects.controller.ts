import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('v1/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Request() req: any, @Body() data: { title: string; description: string; budget?: number; timeline?: string }) {
    // Extract userId from JWT token (will be added by auth middleware)
    const userId = req.user?.sub || req.userId || 'test-user';
    return await this.projectsService.create(userId, data);
  }

  @Get()
  async findAll(@Request() req: any) {
    const userId = req.user?.sub || req.userId || 'test-user';
    return await this.projectsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') projectId: string, @Request() req: any) {
    const userId = req.user?.sub || req.userId || 'test-user';
    return await this.projectsService.findOne(projectId, userId);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') projectId: string, @Body() data: { status: string }) {
    return await this.projectsService.updateStatus(projectId, data.status);
  }

  @Delete(':id')
  async delete(@Param('id') projectId: string, @Request() req: any) {
    const userId = req.user?.sub || req.userId || 'test-user';
    return await this.projectsService.delete(projectId, userId);
  }
}
