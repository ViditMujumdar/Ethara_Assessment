export const WORKSPACE_ROLES = ['owner', 'admin', 'manager', 'member'];

export const WORKSPACE_PERMISSIONS = {
  owner: [
    'workspace:read', 'workspace:update', 'workspace:delete',
    'members:invite', 'members:remove', 'members:update_role',
    'tasks:create', 'tasks:read', 'tasks:update', 'tasks:delete',
    'settings:manage', 'billing:manage',
  ],
  admin: [
    'workspace:read', 'workspace:update',
    'members:invite', 'members:remove', 'members:update_role',
    'tasks:create', 'tasks:read', 'tasks:update', 'tasks:delete',
    'settings:manage',
  ],
  manager: [
    'workspace:read', 'workspace:update',
    'members:invite',
    'tasks:create', 'tasks:read', 'tasks:update', 'tasks:delete',
  ],
  member: [
    'workspace:read',
    'tasks:create', 'tasks:read', 'tasks:update',
  ],
};

export const hasPermission = (role, permission) =>
  (WORKSPACE_PERMISSIONS[role] || []).includes(permission);

export default WORKSPACE_PERMISSIONS;
