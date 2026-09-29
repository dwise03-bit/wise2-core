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
  Res,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { SoundLabsService } from './sound-labs.service';
import { UploadedFileData } from '../gallery/gallery.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  GenerateMusicDto,
  CreateVersionDto,
  CreateCommentDto,
  SetApprovalDto,
  AttachAssetDto,
  ClientReviewCommentDto,
  ClientReviewApprovalDto,
} from './dto';

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
   * POST /v1/sound-labs/me/projects/:projectId/generate
   * Generate music for a project via the MusicGen service.
   * SECURE: JWT required, ownership + entitlements enforced.
   * Synchronous: resolves once audio is ready.
   */
  @Post('me/projects/:projectId/generate')
  @UseGuards(JwtAuthGuard)
  async generate(
    @Req() req: Request & { user: any },
    @Param('projectId') projectId: string,
    @Body() dto: GenerateMusicDto,
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const project = await this.soundLabsService.generate(
      projectId,
      req.user.id,
      dto,
    );
    return {
      success: true,
      project,
    };
  }

  /**
   * GET /v1/sound-labs/me/projects/:projectId/generate
   * Poll current generation status/result for a project.
   * SECURE: JWT required, ownership enforced.
   */
  @Get('me/projects/:projectId/generate')
  @UseGuards(JwtAuthGuard)
  async getGenerationStatus(
    @Req() req: Request & { user: any },
    @Param('projectId') projectId: string,
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const project = await this.soundLabsService.getUserProject(
      projectId,
      req.user.id,
    );
    return {
      success: true,
      jobId: project.generationJobId,
      status: project.generationStatus,
      audioUrl: project.generatedAudioUrl,
      generatedAt: project.generatedAt,
    };
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

  @Post('me/projects/:projectId/recordings')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 100 * 1024 * 1024 } }))
  async uploadRecording(
    @Req() req: Request & { user: any },
    @Param('projectId') projectId: string,
    @UploadedFile() file: UploadedFileData,
    @Body('name') name?: string,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('User not authenticated');
    if (!file) throw new BadRequestException('No audio file provided');
    return this.soundLabsService.uploadRecording(projectId, req.user.id, file, name);
  }

  @Post('me/projects/:projectId/assets')
  @UseGuards(JwtAuthGuard)
  async attachAsset(
    @Req() req: Request & { user: any },
    @Param('projectId') projectId: string,
    @Body() dto: AttachAssetDto,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('User not authenticated');
    return this.soundLabsService.attachGalleryAsset(
      projectId,
      req.user.id,
      dto.galleryAssetId,
      dto.name,
    );
  }

  @Get('me/projects/:projectId/versions')
  @UseGuards(JwtAuthGuard)
  async listVersions(
    @Req() req: Request & { user: any },
    @Param('projectId') projectId: string,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('User not authenticated');
    const versions = await this.soundLabsService.listVersions(projectId, req.user.id);
    return { versions };
  }

  @Post('me/projects/:projectId/versions')
  @UseGuards(JwtAuthGuard)
  async createVersion(
    @Req() req: Request & { user: any },
    @Param('projectId') projectId: string,
    @Body() dto: CreateVersionDto,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('User not authenticated');
    const version = await this.soundLabsService.createVersion(
      projectId,
      req.user.id,
      dto.label,
      dto.changeLog,
    );
    return { success: true, version };
  }

  @Post('me/projects/:projectId/versions/:versionId/restore')
  @UseGuards(JwtAuthGuard)
  async restoreVersion(
    @Req() req: Request & { user: any },
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('User not authenticated');
    const project = await this.soundLabsService.restoreVersion(
      projectId,
      req.user.id,
      versionId,
    );
    return { success: true, project };
  }

  @Get('me/projects/:projectId/comments')
  @UseGuards(JwtAuthGuard)
  async listComments(
    @Req() req: Request & { user: any },
    @Param('projectId') projectId: string,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('User not authenticated');
    const comments = await this.soundLabsService.listComments(projectId, req.user.id);
    return { comments };
  }

  @Post('me/projects/:projectId/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Req() req: Request & { user: any },
    @Param('projectId') projectId: string,
    @Body() dto: CreateCommentDto,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('User not authenticated');
    const comment = await this.soundLabsService.addComment(
      projectId,
      req.user.id,
      dto.content,
      dto.timestamp,
      dto.trackId,
    );
    return { success: true, comment };
  }

  @Post('me/projects/:projectId/approval')
  @UseGuards(JwtAuthGuard)
  async setApproval(
    @Req() req: Request & { user: any },
    @Param('projectId') projectId: string,
    @Body() dto: SetApprovalDto,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('User not authenticated');
    const project = await this.soundLabsService.setApproval(
      projectId,
      req.user.id,
      dto.status,
      dto.note,
    );
    return { success: true, project };
  }

  @Get('audio/:generationId')
  @UseGuards(JwtAuthGuard)
  async streamGeneratedAudio(
    @Req() req: Request & { user: any },
    @Param('generationId') generationId: string,
    @Res() res: Response,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('User not authenticated');
    const upstream = await this.soundLabsService.getOwnedGenerationAudio(
      generationId,
      req.user.id,
    );
    if (!upstream || !upstream.body) {
      throw new BadRequestException('Generated audio not found or expired');
    }
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'audio/wav');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.send(buf);
  }

  @Post('me/projects/:projectId/review-link')
  @UseGuards(JwtAuthGuard)
  async createReviewLink(
    @Req() req: Request & { user: any },
    @Param('projectId') projectId: string,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('User not authenticated');
    const link = await this.soundLabsService.createReviewLink(projectId, req.user.id);
    return { success: true, ...link };
  }

  @Get('review/:token')
  async getReviewProject(@Param('token') token: string) {
    const project = await this.soundLabsService.getProjectForReview(token);
    return { success: true, project };
  }

  @Get('review/:token/comments')
  async listReviewComments(@Param('token') token: string) {
    const comments = await this.soundLabsService.listReviewComments(token);
    return { comments };
  }

  @Post('review/:token/comments')
  async addReviewComment(
    @Param('token') token: string,
    @Body() dto: ClientReviewCommentDto,
  ) {
    const comment = await this.soundLabsService.addClientReviewComment(
      token,
      dto.content,
      dto.authorName,
      dto.timestamp,
    );
    return { success: true, comment };
  }

  @Post('review/:token/approval')
  async setReviewApproval(
    @Param('token') token: string,
    @Body() dto: ClientReviewApprovalDto,
  ) {
    const project = await this.soundLabsService.setClientReviewApproval(
      token,
      dto.status,
      dto.note,
      dto.authorName,
    );
    return { success: true, project };
  }

  @Get('review/:token/recordings/:recordingId/audio')
  async streamReviewRecording(
    @Param('token') token: string,
    @Param('recordingId') recordingId: string,
    @Res() res: Response,
  ) {
    const { buffer, mimeType } = await this.soundLabsService.streamReviewRecording(token, recordingId);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(buffer);
  }
}
