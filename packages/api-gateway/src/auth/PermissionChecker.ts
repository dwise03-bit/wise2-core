/**
 * Permission Checker
 * Role-based access control for API endpoints
 */

interface User {
  id: string;
  roles: string[];
  permissions: string[];
}

interface RoutePermission {
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

export class PermissionChecker {
  private routePermissions: Map<string, RoutePermission> = new Map();
  private rolePermissions: Map<string, string[]> = new Map();

  constructor() {
    this.initializePermissions();
  }

  private initializePermissions(): void {
    // Define role-based permissions
    this.rolePermissions.set('admin', [
      'read:*',
      'write:*',
      'delete:*',
      'manage:users',
      'manage:agents',
      'manage:automations',
      'view:metrics',
      'view:logs',
    ]);

    this.rolePermissions.set('agent_owner', [
      'read:own_agent',
      'write:own_agent',
      'execute:own_agent',
      'view:own_metrics',
      'view:own_logs',
    ]);

    this.rolePermissions.set('user', [
      'read:own_data',
      'write:own_data',
      'execute:own_automations',
    ]);

    this.rolePermissions.set('service', [
      'read:*',
      'write:*',
      'execute:*',
    ]);

    // Define route-specific permissions
    this.defineRoutePermissions();
  }

  private defineRoutePermissions(): void {
    // Executive Agent routes
    this.registerRoute('/api/executive/*', 'GET', ['admin', 'agent_owner']);
    this.registerRoute('/api/executive/*', 'POST', ['admin', 'agent_owner']);

    // Developer Agent routes
    this.registerRoute('/api/developer/*', 'GET', ['admin', 'agent_owner']);
    this.registerRoute('/api/developer/*', 'POST', ['admin', 'agent_owner']);

    // Infrastructure Agent routes
    this.registerRoute('/api/infrastructure/*', 'GET', ['admin']);
    this.registerRoute('/api/infrastructure/*', 'POST', ['admin']);
    this.registerRoute('/api/infrastructure/*', 'DELETE', ['admin']);

    // Deployment Agent routes
    this.registerRoute('/api/deployment/*', 'GET', ['admin', 'agent_owner']);
    this.registerRoute('/api/deployment/*', 'POST', ['admin']);

    // Voice Assistant routes
    this.registerRoute('/api/voice/*', 'GET', ['admin', 'user']);
    this.registerRoute('/api/voice/*', 'POST', ['admin', 'user']);

    // Knowledge Graph routes
    this.registerRoute('/api/knowledge-graph/*', 'GET', ['admin', 'user']);
    this.registerRoute('/api/knowledge-graph/*', 'POST', ['admin']);

    // Automations routes
    this.registerRoute('/api/automations/*', 'GET', ['admin', 'user']);
    this.registerRoute('/api/automations/*', 'POST', ['admin', 'user']);
    this.registerRoute('/api/automations/*', 'DELETE', ['admin']);

    // Discord routes
    this.registerRoute('/api/discord/*', 'GET', ['admin']);
    this.registerRoute('/api/discord/*', 'POST', ['admin']);

    // Sync routes
    this.registerRoute('/api/sync/*', 'GET', ['admin', 'user']);
    this.registerRoute('/api/sync/*', 'POST', ['admin', 'user']);

    // Health routes
    this.registerRoute('/api/health/*', 'GET', ['admin', 'service']);
  }

  private registerRoute(
    path: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT',
    requiredRoles: string[]
  ): void {
    const key = `${method} ${path}`;
    this.routePermissions.set(key, {
      path,
      method,
      requiredRoles,
    });
  }

  async check(
    user: User | undefined,
    method: string,
    path: string
  ): Promise<boolean> {
    if (!user) {
      return false;
    }

    // Admin bypass
    if (user.roles.includes('admin')) {
      return true;
    }

    // Service-to-service bypass
    if (user.roles.includes('service')) {
      return true;
    }

    // Check route-specific permissions
    const routePermission = this.findRoutePermission(method, path);

    if (!routePermission) {
      // If no specific permission defined, allow (permissive by default)
      return true;
    }

    // Check if user has required role
    if (routePermission.requiredRoles) {
      const hasRole = user.roles.some((role) =>
        routePermission.requiredRoles!.includes(role)
      );

      if (!hasRole) {
        return false;
      }
    }

    // Check if user has required permissions
    if (routePermission.requiredPermissions) {
      const hasPermission = routePermission.requiredPermissions.some(
        (permission) => {
          // Check direct permission
          if (user.permissions.includes(permission)) {
            return true;
          }

          // Check wildcard permissions
          const [resource, action] = permission.split(':');
          const wildcardPermission = `${resource}:*`;

          return user.permissions.some((p) => {
            if (p === wildcardPermission) return true;
            if (p === '*:*') return true;
            return false;
          });
        }
      );

      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }

  private findRoutePermission(
    method: string,
    path: string
  ): RoutePermission | undefined {
    // Exact match
    const exactKey = `${method} ${path}`;
    if (this.routePermissions.has(exactKey)) {
      return this.routePermissions.get(exactKey);
    }

    // Wildcard match
    for (const [key, permission] of this.routePermissions.entries()) {
      const [keyMethod, keyPath] = key.split(' ');

      if (keyMethod !== method) continue;

      // Convert wildcard path to regex
      const pathRegex = new RegExp(
        '^' + keyPath.replace(/\*/g, '.*') + '$'
      );

      if (pathRegex.test(path)) {
        return permission;
      }
    }

    return undefined;
  }

  // Get permissions for a role
  getPermissionsForRole(role: string): string[] {
    return this.rolePermissions.get(role) || [];
  }

  // Add permission to a role
  addPermissionToRole(role: string, permission: string): void {
    const permissions = this.rolePermissions.get(role) || [];
    if (!permissions.includes(permission)) {
      permissions.push(permission);
      this.rolePermissions.set(role, permissions);
    }
  }

  // Remove permission from a role
  removePermissionFromRole(role: string, permission: string): void {
    const permissions = this.rolePermissions.get(role) || [];
    const index = permissions.indexOf(permission);
    if (index > -1) {
      permissions.splice(index, 1);
      this.rolePermissions.set(role, permissions);
    }
  }
}

export default PermissionChecker;
