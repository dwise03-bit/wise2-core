import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    let user = request.user;

    // Support SSH key authentication (extract from SSH_CLIENT env var or connection metadata)
    if (!user || !user.permissions) {
      user = this.extractSshUserContext(request);
    }

    if (!user || !user.permissions) {
      throw new ForbiddenException('User context or permissions not found');
    }

    if (!Array.isArray(user.permissions)) {
      user.permissions = [user.permissions];
    }

    if (!user.permissions.includes(requiredPermission)) {
      throw new ForbiddenException(
        `Missing required permission: ${requiredPermission}`,
      );
    }

    return true;
  }

  /**
   * Extract user context from SSH key authentication
   * SSH key comments like "surface-dev@wise2" or "mac-bridge@wise2"
   * are mapped to permission sets
   */
  private extractSshUserContext(request: any): any {
    const sshClient = process.env.SSH_CLIENT || request.headers['x-ssh-client'] || '';
    const sshKeyComment = process.env.SSH_KEY_COMMENT || request.headers['x-ssh-key-comment'] || '';
    const remoteUser = process.env.REMOTE_USER || process.env.USER || 'dwise';

    // Map SSH key comments to permission sets
    const permissionMap: Record<string, string[]> = {
      'surface-dev@wise2': ['surface:access', 'device:remote', 'automation:execute'],
      'mac-bridge@wise2': ['mac:access', 'desktop:control', 'automation:execute'],
      'claude-automation@wise2': ['automation:execute', 'deployment:trigger', 'monitoring:read'],
      'default': ['read:access'],
    };

    const permissions = permissionMap[sshKeyComment] || permissionMap['default'];

    return {
      id: remoteUser,
      username: remoteUser,
      email: `${remoteUser}@wise2.net`,
      source: 'ssh-key',
      keyComment: sshKeyComment,
      sshClient,
      permissions,
      authenticated: !!sshClient && sshClient !== '',
    };
  }
}
