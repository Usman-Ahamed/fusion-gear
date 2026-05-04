import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadImage(fileBuffer, folder = 'fusion-gear/reviews') {
  // Product images: 1080x1350 (4:5 portrait ratio)
  // Review images: 1200px max width
  const isProduct = folder.includes('products');

  const transformation = isProduct
    ? [
        { width: 1080, height: 1350, crop: 'fill', gravity: 'auto' },
        { quality: 'auto', fetch_format: 'auto' },
      ]
    : [
        { width: 1200, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ];

  const eager = isProduct
    ? [
        { width: 540, height: 675, crop: 'fill', gravity: 'auto', quality: 'auto', fetch_format: 'auto' },
      ]
    : [
        { width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
      ];

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation,
        eager,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
}

export async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
}
