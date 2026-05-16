import * as uploadService from '../services/upload.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import ApiResponse from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const upload = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file provided');
  const file = await uploadService.uploadFile(req.file);
  sendResponse(res, ApiResponse.created({ file }));
});

export const remove = asyncHandler(async (req, res) => {
  await uploadService.deleteFile(req.body.publicId);
  sendResponse(res, ApiResponse.ok(null, 'File deleted'));
});

export default { upload, remove };
