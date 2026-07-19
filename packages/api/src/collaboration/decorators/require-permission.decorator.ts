import { SetMetadata } from '@nestjs/common';
import { PermissionType } from '../interfaces/collaboration.types';

/**
 * Metadata key for storing required permissions
 */
export const PERMISSION_KEY = 'required_permission';

/**
 * RequirePermission Decorator
 * Marks an endpoint as requiring a specific permission
 * Used with PermissionGuard to enforce access control
 *
 * @example
 * @Get(':id/collaborators')
 * @UseGuards(JwtAuthGuard, PermissionGuard)
 * @RequirePermission('manage_collaborators')
 * async getCollaborators(@Param('id') projectId: string) {
 *   // Only users with 'manage_collaborators' permission can access
 * }
 */
export const RequirePermission = (permission: PermissionType) =>
  SetMetadata(PERMISSION_KEY, permission);
