import * as aiService from '../services/ai.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import ApiResponse from '../utils/ApiResponse.js';

export const summarize = asyncHandler(async (req, res) => {
  const summary = await aiService.summarizeTask(req.user._id, req.body.workspaceId, req.body.description);
  sendResponse(res, ApiResponse.ok({ summary }));
});

export const breakdown = asyncHandler(async (req, res) => {
  const subtasks = await aiService.breakdownTask(req.user._id, req.body.workspaceId, req.body.title);
  sendResponse(res, ApiResponse.ok({ subtasks }));
});

export const prioritize = asyncHandler(async (req, res) => {
  const result = await aiService.prioritizeTasks(req.user._id, req.body.workspaceId, req.body.tasks);
  sendResponse(res, ApiResponse.ok({ result }));
});

export const chat = asyncHandler(async (req, res) => {
  const reply = await aiService.chatAssistant(req.user._id, req.body.workspaceId, req.body.messages);
  sendResponse(res, ApiResponse.ok({ reply }));
});

export const meetingNotes = asyncHandler(async (req, res) => {
  const tasks = await aiService.meetingNotesToTasks(req.user._id, req.body.workspaceId, req.body.notes);
  sendResponse(res, ApiResponse.ok({ tasks }));
});

export default { summarize, breakdown, prioritize, chat, meetingNotes };
