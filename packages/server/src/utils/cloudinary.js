import { v2 as cloudinary } from 'cloudinary';
import { compressImage } from './imageCompressor.js';

// Configure cloudinary if env vars are present
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const uploadToCloudinary = async (fileBuffer, folder = 'zenithbazaar') => {
  try {
    // Compress image before uploading to speed up loading and save storage bandwidth
    const optimizedBuffer = await compressImage(fileBuffer, { maxWidth: 1200, maxHeight: 1200, quality: 80 });

    return new Promise((resolve, reject) => {
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        // Fallback mock upload if credentials aren't set yet
        return resolve('https://via.placeholder.com/600x600?text=ZenithBazaar+Product');
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, format: 'jpg' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );

      uploadStream.end(optimizedBuffer);
    });
  } catch (error) {
    console.error('Cloudinary upload with compression error:', error);
    throw error;
  }
};
