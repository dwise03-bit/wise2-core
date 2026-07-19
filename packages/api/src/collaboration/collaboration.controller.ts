import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CollaborationService } from './collaboration.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { RequirePermission } from './decorators/require-permission.decorator';
import {
  CreateCommentDto,
  InviteCollaboratorDto,
  UpdatePermissionsDto,
} from './dto';

/**
 * Collaboration REST API Controller
 * Provides HTTP endpoints for collaboration features
 *
 * Endpoints:
 * - GET /projects/:id/collaborators - List collaborators
 * - POST /projects/:id/invite - Send invite
 * - GET /projects/:id/comments - List comments
 * - POST /projects/:id/comments - Create comment
 * - GET /projects/:id/history - View activity history
 * - GET /projects/:id/versions - List versions
 * - POST /projects/:id/rollback/:versionId - Rollback version
 * - PUT /projects/:id/permissions - Update permissions
 *
 * All endpoints require JWT authentication and appropriate permissions
 */
@ApiTags('Collaboration')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CollaborationController {
  private readonly logger = new Logger('CollaborationController');

  constructor(private collaborationService: CollaborationService) {}

  /**
   * GET /projects/:id/collaborators
   * List all collaborators on a project
   */
  @Get(':id/collaborators')
  @ApiOperation({ summary: 'Get all collaborators for a project' })
  @ApiResponse({
    status: 200,
    description: 'List of collaborators with roles and permissions',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getCollaborators(
    @Param('id') projectId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Fetching collaborators for project ${projectId}`);
    return this.collaborationService.getCollaborators(projectId);
  }

  /**
   * POST /projects/:id/invite
   * Send a project invitation to a collaborator
   */
  @Post(':id/invite')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionGuard)
  @RequirePermission('share_project')
  @ApiOperation({ summary: 'Send project invitation' })
  @ApiResponse({
    status: 201,
    description: 'Invitation created and email sent',
  })
  @ApiResponse({ status: 400, description: 'Invalid email or user already a collaborator' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async inviteCollaborator(
    @Param('id') projectId: string,
    @Body() inviteDto: InviteCollaboratorDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(
      `Invitation created for ${inviteDto.invitedEmail} to project ${projectId} by user ${user.id}`,
    );
    return this.collaborationService.inviteCollaborator(
      projectId,
      user.id,
      inviteDto,
    );
  }

  /**
   * GET /projects/:id/comments
   * Get all comments on a project
   */
  @Get(':id/comments')
  @ApiOperation({ summary: 'Get all comments for a project' })
  @ApiResponse({
    status: 200,
    description: 'List of comments with threaded structure',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getComments(
    @Param('id') projectId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Fetching comments for project ${projectId}`);
    return this.collaborationService.getComments(projectId);
  }

  /**
   * POST /projects/:id/comments
   * Create a new comment on a project
   */
  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionGuard)
  @RequirePermission('edit_track')
  @ApiOperation({ summary: 'Create a comment on a project' })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid comment content' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async createComment(
    @Param('id') projectId: string,
    @Body() commentDto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Comment created on project ${projectId} by user ${user.id}`);
    return this.collaborationService.createComment(projectId, user.id, commentDto);
  }

  /**
   * GET /projects/:id/activity
   * Get activity history for a project
   */
  @Get(':id/activity')
  @ApiOperation({ summary: 'Get activity history for a project' })
  @ApiResponse({
    status: 200,
    description: 'List of activities with user and timestamp information',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getActivityHistory(
    @Param('id') projectId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Fetching activity history for project ${projectId}`);
    return this.collaborationService.getActivityHistory(projectId);
  }

  /**
   * GET /projects/:id/versions
   * Get version history for a project
   */
  @Get(':id/versions')
  @ApiOperation({ summary: 'Get version history for a project' })
  @ApiResponse({
    status: 200,
    description: 'List of version snapshots',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getVersionHistory(
    @Param('id') projectId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Fetching version history for project ${projectId}`);
    return this.collaborationService.getVersionHistory(projectId);
  }

  /**
   * POST /projects/:id/rollback/:versionId
   * Rollback project to a previous version
   */
  @Post(':id/rollback/:versionId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @RequirePermission('manage_versions')
  @ApiOperation({ summary: 'Rollback project to a previous version' })
  @ApiResponse({
    status: 200,
    description: 'Rollback completed successfully',
  })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  @ApiResponse({ status: 404, description: 'Project or version not found' })
  async rollbackToVersion(
    @Param('id') projectId: string,
    @Param('versionId') versionId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.log(
      `Rollback initiated for project ${projectId} to version ${versionId} by user ${user.id}`,
    );
    return this.collaborationService.rollbackToVersion(projectId, user.id, versionId);
  }

  /**
   * PUT /projects/:id/permissions
   * Update collaborator permissions
   */
  @Put(':id/permissions')
  @UseGuards(PermissionGuard)
  @RequirePermission('manage_collaborators')
  @ApiOperation({ summary: 'Update collaborator permissions' })
  @ApiResponse({
    status: 200,
    description: 'Permissions updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid collaborator ID' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  @ApiResponse({ status: 404, description: 'Project or collaborator not found' })
  async updatePermissions(
    @Param('id') projectId: string,
    @Body() updateDto: UpdatePermissionsDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(
      `Permissions updated for collaborator ${updateDto.collaboratorId} on project ${projectId} by user ${user.id}`,
    );
    return this.collaborationService.updatePermissions(projectId, user.id, updateDto);
  }

  /**
   * GET /projects/:id/active-users
   * Get currently active users in a project
   */
  @Get(':id/active-users')
  @ApiOperation({ summary: 'Get active users in a project' })
  @ApiResponse({
    status: 200,
    description: 'List of currently active users with presence info',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getActiveUsers(
    @Param('id') projectId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Fetching active users for project ${projectId}`);
    return this.collaborationService.getActiveUsers(projectId);
  }
}
