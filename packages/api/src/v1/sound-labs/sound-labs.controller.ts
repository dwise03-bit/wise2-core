import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { SoundLabsService } from './sound-labs.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@Controller('v1/sound-labs')
export class SoundLabsController {
  constructor(private soundLabsService: SoundLabsService) {}

  /**
   * GET /v1/sound-labs/me/projects
   * List authenticated user's Sound Labs projects
   * SECURE: JWT required, returns only user's projects
   */
  @Get('me/projects')
  @UseGuards(JwtAuthGuard)
  async listProjects(@Req() req: Request & { user: any }) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      const projects = await this.soundLabsService.getUserProjects(req.user.id);
      return {
        projects,
        count: projects.length,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to list projects: ${message}`);
    }
  }

  /**
   * POST /v1/sound-labs/me/projects
   * Create a new Sound Labs project
   * SECURE: JWT required, ownership enforced, entitlements checked
   */
  @Post('me/projects')
  @UseGuards(JwtAuthGuard)
  async createProject(
    @Req() req: Request & { user: any },
    @Body() dto: CreateProjectDto,
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      const project = await this.soundLabsService.createProject(
        req.user.id,
        dto,
      );
      return {
        success: true,
        project,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to create project: ${message}`);
    }
  }

  /**
   * GET /v1/sound-labs/me/projects/:projectId
   * Get project details with ownership verification
   * SECURE: JWT required, ownership enforced
   */
  @Get('me/projects/:projectId')
  @UseGuards(JwtAuthGuard)
  async getProject(
    @Req() req: Request & { user: any },
    @Param('projectId') projectId: string,
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      const project = await this.soundLabsService.getUserProject(
        projectId,
        req.user.id,
      );
      return project;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to fetch project: ${message}`);
    }
  }

  /**
   * PATCH /v1/sound-labs/me/projects/:projectId
   * Update project with ownership verification
   * SECURE: JWT required, ownership enforced
   */
  @Patch('me/projects/:projectId')
  @UseGuards(JwtAuthGuard)
  async updateProject(
    @Req() req: Request & { user: any },
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      const project = await this.soundLabsService.updateProject(
        projectId,
        req.user.id,
        dto,
      );
      return {
        success: true,
        project,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to update project: ${message}`);
    }
  }

  /**
   * DELETE /v1/sound-labs/me/projects/:projectId
   * Delete project with ownership verification
   * SECURE: JWT required, ownership enforced
   */
  @Delete('me/projects/:projectId')
  @UseGuards(JwtAuthGuard)
  async deleteProject(
    @Req() req: Request & { user: any },
    @Param('projectId') projectId: string,
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      await this.soundLabsService.deleteProject(projectId, req.user.id);
      return {
        success: true,
        message: 'Project deleted',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to delete project: ${message}`);
    }
  }

  /**
   * GET /v1/sound-labs/me/can-generate
   * Check if user can generate music based on entitlements
   * SECURE: JWT required
   */
  @Get('me/can-generate')
  @UseGuards(JwtAuthGuard)
  async checkGenerationEligibility(@Req() req: Request & { user: any }) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      const result = await this.soundLabsService.canGenerate(req.user.id);
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to check eligibility: ${message}`);
    }
  }
}
