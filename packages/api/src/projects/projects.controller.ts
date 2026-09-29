import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('v1/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // Legacy project methods (kept for backward compatibility)
  @Post()
  async create(@Request() req: any, @Body() data: { title: string; description: string; budget?: number; timeline?: string }) {
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

  // SoundLabs API endpoints disabled - schema pending
}
