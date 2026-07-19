import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CollaborationService } from '../collaboration.service';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

/**
 * Permission Guard
 * Enforces role-based access control for collaboration endpoints
 * Checks if user has required permission for the action
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger('PermissionGuard');

  constructor(
    private reflector: Reflector,
    private collaborationService: CollaborationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    // If no permission is required, allow access
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const { id: projectId } = request.params;

    if (!user || !user.id) {
      this.logger.warn(`Access attempt without authentication`);
      throw new ForbiddenException('User not authenticated');
    }

    if (!projectId) {
      this.logger.warn(`Access attempt without project ID`);
      throw new ForbiddenException('Project ID is required');
    }

    try {
      // Check if user has the required permission
      const hasPermission = await this.collaborationService.hasPermission(
        projectId,
        user.id,
        requiredPermission as any,
      );

      if (!hasPermission) {
        this.logger.warn(
          `Permission denied for user ${user.id} on project ${projectId}: ${requiredPermission}`,
        );
        throw new ForbiddenException(
          `User does not have permission to ${requiredPermission}`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(
        `Error checking permission: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new ForbiddenException('Failed to verify permissions');
    }
  }
}
