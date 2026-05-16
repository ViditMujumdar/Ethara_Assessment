import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Workspace from '../models/Workspace.js';
import { WORKSPACE_PERMISSIONS } from '../utils/permissions.js';

export const loadWorkspace = asyncHandler(async (req, _res, next) => {
  const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;
  if (!workspaceId) {
    throw ApiError.badRequest('Workspace ID required');
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw ApiError.notFound('Workspace not found');
  }

  const member = workspace.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  );

  if (!member) {
    throw ApiError.forbidden('Not a workspace member');
  }

  req.workspace = workspace;
  req.memberRole = member.role;
  next();
});

export const requireWorkspacePermission = (permission) =>
  asyncHandler(async (req, _res, next) => {
    const rolePermissions = WORKSPACE_PERMISSIONS[req.memberRole] || [];
    if (!rolePermissions.includes(permission)) {
      throw ApiError.forbidden(`Missing permission: ${permission}`);
    }
    next();
  });

export default loadWorkspace;
