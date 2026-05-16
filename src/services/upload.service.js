import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';

if (config.cloudinary.cloudName) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024;

export const uploadFile = async (file) => {
  if (!config.cloudinary.cloudName) {
    throw ApiError.internal('Cloudinary not configured');
  }
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw ApiError.badRequest('File type not allowed');
  }
  if (file.size > MAX_SIZE) {
    throw ApiError.badRequest('File too large (max 10MB)');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'taskflow', resource_type: 'auto' },
      (error, result) => {
        if (error) reject(ApiError.internal('Upload failed'));
        else resolve({
          url: result.secure_url,
          publicId: result.public_id,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });
      }
    );
    stream.end(file.buffer);
  });
};

export const deleteFile = async (publicId) => {
  if (!publicId || !config.cloudinary.cloudName) return;
  await cloudinary.uploader.destroy(publicId);
};

export default { uploadFile, deleteFile };
