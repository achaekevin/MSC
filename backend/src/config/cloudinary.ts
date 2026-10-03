import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';
import { logger } from './logger.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true
});

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder = 'msc_media',
  filename?: string
): Promise<UploadResult> => {
  // If in development or demo mode and no real Cloudinary secret configured, provide a mock upload response
  if (
    env.CLOUDINARY_CLOUD_NAME === 'demo_cloud' ||
    !env.CLOUDINARY_API_SECRET ||
    env.CLOUDINARY_API_SECRET === 'secret'
  ) {
    logger.warn('Mocking Cloudinary upload in development/demo mode.');
    const mockId = `${folder}/${Date.now()}_${filename || 'media'}`;
    return {
      publicId: mockId,
      secureUrl: `/images/mwancha-facility-main.jpg`,
      format: 'jpg',
      bytes: fileBuffer.length,
      width: 1200,
      height: 800
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        resource_type: 'image'
      },
      (error, result) => {
        if (error || !result) {
          logger.error({ error }, 'Cloudinary upload failed.');
          return reject(error || new Error('Upload result is undefined.'));
        }
        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    if (
      env.CLOUDINARY_CLOUD_NAME === 'demo_cloud' ||
      !env.CLOUDINARY_API_SECRET ||
      env.CLOUDINARY_API_SECRET === 'secret'
    ) {
      logger.info({ publicId }, 'Mocking Cloudinary deletion.');
      return true;
    }

    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === 'ok';
  } catch (error) {
    logger.error({ error, publicId }, 'Cloudinary deletion failed.');
    return false;
  }
};

export { cloudinary };
