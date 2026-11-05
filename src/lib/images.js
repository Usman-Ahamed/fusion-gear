import 'server-only';
import sharp from 'sharp';
import cloudinary from '@/lib/cloudinary';

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // per photo, after client-side compression
export const MAX_PHOTOS = 3;

/** Detects the real file type from its first bytes. Never trust the browser's MIME type. */
export function sniffImageType(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

/**
 * Re-encodes an uploaded image: auto-rotates, caps at 1600px, converts to WebP
 * and strips all metadata (including phone GPS location). Re-encoding also
 * neutralises anything hidden inside the original file.
 */
export async function processImage(buf, { maxSize = 1600 } = {}) {
  const { data, info } = await sharp(buf, { limitInputPixels: 50_000_000 })
    .rotate()
    .resize({ width: maxSize, height: maxSize, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

export function uploadToCloudinary(buf, folder) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: 'image', format: 'webp' }, (err, res) => (err ? reject(err) : resolve(res)))
      .end(buf);
  });
}

/** Validate → process → upload. Returns a photo record for the Review model. */
export async function storeReviewPhoto(file, folder = 'fusion-gear/reviews') {
  if (typeof file?.arrayBuffer !== 'function' || file.size === 0) throw new UploadError('Empty file');
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError('Each photo must be under 4 MB');
  const buf = Buffer.from(await file.arrayBuffer());
  if (!sniffImageType(buf)) throw new UploadError('Photos must be JPG, PNG or WebP');
  const { data, width, height } = await processImage(buf);
  const res = await uploadToCloudinary(data, folder);
  return { url: res.secure_url, publicId: res.public_id, width, height };
}

export class UploadError extends Error {}
