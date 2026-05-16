import crypto from 'crypto';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';

export const createWorkspace = async (userId, data) => {
  const workspace = await Workspace.create({
    ...data,
    owner: userId,
    members: [{ user: userId, role: 'owner' }],
  });
  return workspace.populate('members.user', 'name email avatar');
};

export const getUserWorkspaces = async (userId) => {
  return Workspace.find({ 'members.user': userId, isSuspended: false })
    .populate('members.user', 'name email avatar')
    .populate('owner', 'name email avatar')
    .sort({ updatedAt: -1 });
};

export const getWorkspaceById = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId)
    .populate('members.user', 'name email avatar')
    .populate('owner', 'name email avatar');
  if (!workspace) throw ApiError.notFound('Workspace not found');
  const isMember = workspace.members.some((m) => m.user._id.toString() === userId.toString());
  if (!isMember) throw ApiError.forbidden('Not a workspace member');
  return workspace;
};

export const updateWorkspace = async (workspaceId, userId, data) => {
  const workspace = await getWorkspaceById(workspaceId, userId);
  Object.assign(workspace, data);
  workspace.activityLogs.push({ action: 'workspace_updated', user: userId, details: data });
  await workspace.save();
  return workspace;
};

export const deleteWorkspace = async (workspaceId, userId) => {
  const workspace = await getWorkspaceById(workspaceId, userId);
  const member = workspace.members.find((m) => m.user._id.toString() === userId.toString());
  if (member.role !== 'owner') throw ApiError.forbidden('Only owner can delete workspace');
  await workspace.deleteOne();
};

export const inviteMember = async (workspaceId, userId, { email, role }) => {
  const workspace = await getWorkspaceById(workspaceId, userId);
  const token = crypto.randomBytes(32).toString('hex');
  workspace.invites.push({
    email,
    role,
    token,
    invitedBy: userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  workspace.activityLogs.push({ action: 'member_invited', user: userId, details: { email, role } });
  await workspace.save();

  const invitedUser = await User.findOne({ email });
  if (invitedUser) {
    await Notification.create({
      user: invitedUser._id,
      workspace: workspace._id,
      type: 'invite',
      title: 'Workspace invitation',
      message: `You've been invited to join ${workspace.name}`,
      link: `/workspaces/${workspace._id}/invite?token=${token}`,
    });
  }
  return { token, workspace };
};

export const acceptInvite = async (workspaceId, token, userId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw ApiError.notFound('Workspace not found');

  const invite = workspace.invites.find((i) => i.token === token && i.expiresAt > new Date());
  if (!invite) throw ApiError.badRequest('Invalid or expired invite');

  const user = await User.findById(userId);
  if (user.email !== invite.email) throw ApiError.forbidden('Invite email mismatch');

  workspace.members.push({ user: userId, role: invite.role });
  workspace.invites = workspace.invites.filter((i) => i.token !== token);
  workspace.activityLogs.push({ action: 'member_joined', user: userId });
  await workspace.save();
  return workspace.populate('members.user', 'name email avatar');
};

export const removeMember = async (workspaceId, userId, memberId) => {
  const workspace = await getWorkspaceById(workspaceId, userId);
  workspace.members = workspace.members.filter((m) => m.user.toString() !== memberId);
  workspace.activityLogs.push({ action: 'member_removed', user: userId, details: { memberId } });
  await workspace.save();
  return workspace;
};

export const updateMemberRole = async (workspaceId, userId, memberId, role) => {
  const workspace = await getWorkspaceById(workspaceId, userId);
  const member = workspace.members.find((m) => m.user.toString() === memberId);
  if (!member) throw ApiError.notFound('Member not found');
  member.role = role;
  await workspace.save();
  return workspace;
};

export default {
  createWorkspace, getUserWorkspaces, getWorkspaceById, updateWorkspace,
  deleteWorkspace, inviteMember, acceptInvite, removeMember, updateMemberRole,
};
