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

  // SoundLabs Studio Projects
  @ApiOperation({ summary: 'Create a new SoundLabs studio project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @Post('soundlabs')
  async createSoundLabsProject(
    @Request() req: any,
    @Body() data: { name: string; description?: string; mixerState?: any }
  ) {
    const userId = req.user?.sub || req.userId || 'test-user';
    return await this.projectsService.createSoundLabsProject(userId, data);
  }

  @ApiOperation({ summary: 'List all SoundLabs projects for the current user' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  @Get('soundlabs')
  async listSoundLabsProjects(@Request() req: any) {
    const userId = req.user?.sub || req.userId || 'test-user';
    return await this.projectsService.listSoundLabsProjects(userId);
  }

  @ApiOperation({ summary: 'Get a specific SoundLabs project' })
  @ApiResponse({ status: 200, description: 'Project details' })
  @Get('soundlabs/:id')
  async getSoundLabsProject(@Param('id') projectId: string, @Request() req: any) {
    const userId = req.user?.sub || req.userId || 'test-user';
    return await this.projectsService.getSoundLabsProject(projectId, userId);
  }

  @ApiOperation({ summary: 'Update a SoundLabs project (e.g., save mixer state)' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @Patch('soundlabs/:id')
  async updateSoundLabsProject(
    @Param('id') projectId: string,
    @Request() req: any,
    @Body() data: { name?: string; description?: string; mixerState?: any }
  ) {
    const userId = req.user?.sub || req.userId || 'test-user';
    return await this.projectsService.updateSoundLabsProject(projectId, userId, data);
  }

  @ApiOperation({ summary: 'Delete a SoundLabs project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @Delete('soundlabs/:id')
  async deleteSoundLabsProject(@Param('id') projectId: string, @Request() req: any) {
    const userId = req.user?.sub || req.userId || 'test-user';
    await this.projectsService.deleteSoundLabsProject(projectId, userId);
    return { success: true, message: 'Project deleted' };
  }

  // Recording Management
  @ApiOperation({ summary: 'Upload an audio recording to a project' })
  @ApiResponse({ status: 201, description: 'Recording uploaded successfully' })
  @Post('soundlabs/:id/recordings')
  @UseInterceptors(FileInterceptor('file'))
  async uploadRecording(
    @Param('id') projectId: string,
    @UploadedFile() file: any,
    @Request() req: any,
    @Body() body: { name?: string; description?: string }
  ) {
    const userId = req.user?.sub || req.userId || 'test-user';

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return await this.projectsService.createRecording(projectId, userId, {
      name: body.name || file.originalname,
      description: body.description,
      fileBuffer: file.buffer,
      fileSize: file.size,
    });
  }

  @ApiOperation({ summary: 'List recordings for a project' })
  @ApiResponse({ status: 200, description: 'List of recordings' })
  @Get('soundlabs/:id/recordings')
  async listRecordings(@Param('id') projectId: string, @Request() req: any) {
    const userId = req.user?.sub || req.userId || 'test-user';
    return await this.projectsService.listRecordings(projectId, userId);
  }

  @ApiOperation({ summary: 'Delete a recording' })
  @ApiResponse({ status: 200, description: 'Recording deleted successfully' })
  @Delete('soundlabs/:id/recordings/:recordingId')
  async deleteRecording(
    @Param('id') projectId: string,
    @Param('recordingId') recordingId: string,
    @Request() req: any
  ) {
    const userId = req.user?.sub || req.userId || 'test-user';
    await this.projectsService.deleteRecording(projectId, recordingId, userId);
    return { success: true, message: 'Recording deleted' };
  }
}
