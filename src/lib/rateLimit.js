import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

// Fixed-window rate limiter stored in MongoDB, so limits hold across
// serverless instances and cold starts (an in-memory Map does not).
const RateLimitSchema = new mongoose.Schema({
  _id: String, // `${key}:${windowIndex}`
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RateLimit = mongoose.models.RateLimit || mongoose.model('RateLimit', RateLimitSchema);

/** Returns true if the request is allowed, false if the limit is exceeded. */
export async function rateLimit(key, max, windowMs) {
  await dbConnect();
  const windowIndex = Math.floor(Date.now() / windowMs);
  const doc = await RateLimit.findOneAndUpdate(
    { _id: `${key}:${windowIndex}` },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((windowIndex + 1) * windowMs) } },
    { upsert: true, new: true, lean: true }
  );
  return doc.count <= max;
}

/**
 * Client IP. On Vercel, x-real-ip / x-forwarded-for are set by the platform
 * and cannot be spoofed by the client.
 */
export function getClientIp(request) {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  );
}
