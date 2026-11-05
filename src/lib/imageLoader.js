// next/image loader: Cloudinary URLs get resized + converted (AVIF/WebP) by
// Cloudinary itself; local files in /public are served as-is.
export default function imageLoader({ src, width, quality }) {
  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    const params = ['f_auto', `q_${quality || 'auto'}`, 'c_limit', `w_${width}`].join(',');
    return src.replace('/upload/', `/upload/${params}/`);
  }
  return src;
}
