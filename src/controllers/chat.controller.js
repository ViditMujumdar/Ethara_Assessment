import * as chatService from '../services/chat.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getMessages = asyncHandler(async (req, res) => {
  const messages = await chatService.getChannelMessages(
    req.params.workspaceId,
    req.query.channel || 'general',
    req.query
  );
  sendResponse(res, ApiResponse.ok({ messages }));
});

export const getDMs = asyncHandler(async (req, res) => {
  const messages = await chatService.getDirectMessages(req.user._id, req.params.userId, req.query);
  sendResponse(res, ApiResponse.ok({ messages }));
});

export const search = asyncHandler(async (req, res) => {
  const messages = await chatService.searchMessages(req.params.workspaceId, req.query.q);
  sendResponse(res, ApiResponse.ok({ messages }));
});

export default { getMessages, getDMs, search };
