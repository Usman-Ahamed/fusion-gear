// Browser-only: shrink a photo before upload so it fits Vercel's 4.5 MB request
// limit and uploads fast on mobile data. The server re-encodes it again anyway.
export async function compressImage(file, { maxSize = 1600, quality = 0.85 } = {}) {
  if (!file.type.startsWith('image/')) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file; // e.g. HEIC on a browser that cannot decode it; the server will reject it with a clear message
  }
}
