export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(str, length = 100) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function getCloudinaryUrl(url, transformations = '') {
  if (!url) return '/placeholder.jpg';
  if (transformations && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/${transformations}/`);
  }
  return url;
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const RATE_LIMIT_MAP = new Map();

export function checkRateLimit(ip, maxRequests = 3, windowMs = 86400000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!RATE_LIMIT_MAP.has(ip)) {
    RATE_LIMIT_MAP.set(ip, []);
  }

  const requests = RATE_LIMIT_MAP.get(ip).filter(time => time > windowStart);
  RATE_LIMIT_MAP.set(ip, requests);

  if (requests.length >= maxRequests) {
    return false;
  }

  requests.push(now);
  return true;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' };
  }
  return { valid: true };
}
