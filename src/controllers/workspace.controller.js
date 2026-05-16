import * as workspaceService from '../services/workspace.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import ApiResponse from '../utils/ApiResponse.js';

export const create = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.createWorkspace(req.user._id, req.body);
  sendResponse(res, ApiResponse.created({ workspace }));
});

export const list = asyncHandler(async (req, res) => {
  const workspaces = await workspaceService.getUserWorkspaces(req.user._id);
  sendResponse(res, ApiResponse.ok({ workspaces }));
});

export const getOne = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.getWorkspaceById(req.params.workspaceId, req.user._id);
  sendResponse(res, ApiResponse.ok({ workspace }));
});

export const update = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.updateWorkspace(req.params.workspaceId, req.user._id, req.body);
  sendResponse(res, ApiResponse.ok({ workspace }));
});

export const remove = asyncHandler(async (req, res) => {
  await workspaceService.deleteWorkspace(req.params.workspaceId, req.user._id);
  sendResponse(res, ApiResponse.ok(null, 'Workspace deleted'));
});

export const invite = asyncHandler(async (req, res) => {
  const result = await workspaceService.inviteMember(req.params.workspaceId, req.user._id, req.body);
  sendResponse(res, ApiResponse.ok(result, 'Invitation sent'));
});

export const acceptInvitation = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.acceptInvite(
    req.params.workspaceId,
    req.body.token,
    req.user._id
  );
  sendResponse(res, ApiResponse.ok({ workspace }));
});

export const removeMember = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.removeMember(
    req.params.workspaceId,
    req.user._id,
    req.params.memberId
  );
  sendResponse(res, ApiResponse.ok({ workspace }));
});

export const updateRole = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.updateMemberRole(
    req.params.workspaceId,
    req.user._id,
    req.params.memberId,
    req.body.role
  );
  sendResponse(res, ApiResponse.ok({ workspace }));
});

export default { create, list, getOne, update, remove, invite, acceptInvitation, removeMember, updateRole };
