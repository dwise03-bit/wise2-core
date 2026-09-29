export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

interface Permission {
  action: string;
  resource: string;
}

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    { action: 'create', resource: '*' },
    { action: 'read', resource: '*' },
    { action: 'update', resource: '*' },
    { action: 'delete', resource: '*' },
    { action: 'export', resource: '*' },
    { action: 'manage_users', resource: 'users' },
  ],
  manager: [
    { action: 'read', resource: '*' },
    { action: 'update', resource: 'projects' },
    { action: 'export', resource: '*' },
    { action: 'deploy', resource: 'applications' },
  ],
  operator: [
    { action: 'read', resource: '*' },
    { action: 'update', resource: 'status' },
  ],
  viewer: [
    { action: 'read', resource: 'public' },
  ],
};

export function hasPermission(role: UserRole, action: string, resource: string): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.some(
    (p) => (p.action === action || p.action === '*') && 
            (p.resource === resource || p.resource === '*')
  );
}

export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] || [];
}
