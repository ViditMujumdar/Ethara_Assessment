import * as taskService from '../services/task.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import ApiResponse from '../utils/ApiResponse.js';

export const create = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.params.workspaceId, req.user._id, req.body);
  sendResponse(res, ApiResponse.created({ task }));
});

export const list = asyncHandler(async (req, res) => {
  const result = await taskService.getTasks(req.params.workspaceId, req.query);
  sendResponse(res, ApiResponse.ok(result));
});

export const getOne = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.taskId, req.params.workspaceId);
  sendResponse(res, ApiResponse.ok({ task }));
});

export const update = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.taskId, req.params.workspaceId, req.user._id, req.body);
  sendResponse(res, ApiResponse.ok({ task }));
});

export const remove = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.taskId, req.params.workspaceId);
  sendResponse(res, ApiResponse.ok(null, 'Task deleted'));
});

export const reorder = asyncHandler(async (req, res) => {
  const result = await taskService.reorderTasks(req.params.workspaceId, req.body.updates);
  sendResponse(res, ApiResponse.ok(result));
});

export const addComment = asyncHandler(async (req, res) => {
  const task = await taskService.addComment(req.params.taskId, req.params.workspaceId, req.user._id, req.body.content);
  sendResponse(res, ApiResponse.created({ task }));
});

export const analytics = asyncHandler(async (req, res) => {
  const data = await taskService.getAnalytics(req.params.workspaceId);
  sendResponse(res, ApiResponse.ok(data));
});

export default { create, list, getOne, update, remove, reorder, addComment, analytics };
