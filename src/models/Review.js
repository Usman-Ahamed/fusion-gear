import mongoose from 'mongoose';
import { CATEGORY_SLUGS } from '@/config/site';

const PhotoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: String,
  width: Number,
  height: Number,
}, { _id: false });

const ReviewSchema = new mongoose.Schema({
  // Legacy single-image fields (admin bulk uploads). New reviews use `photos`.
  imageUrl: String,
  publicId: String,
  thumbnailUrl: String,

  photos: { type: [PhotoSchema], default: undefined },
  name: { type: String, default: 'Happy Customer', trim: true, maxlength: 60 },
  text: { type: String, trim: true, maxlength: 1000 },
  // Only customer-submitted reviews carry a real rating. Admin screenshot
  // uploads stored a default 5 historically; the public site ignores it.
  rating: { type: Number, min: 1, max: 5 },
  product: { type: String, trim: true, maxlength: 120 },
  category: { type: String, enum: CATEGORY_SLUGS },

  // Private: never sent to the public site.
  orderId: { type: String, trim: true, maxlength: 40, select: false },
  contact: { type: String, trim: true, maxlength: 120, select: false },
  verified: { type: Boolean, default: false },

  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  featured: { type: Boolean, default: false },
  source: { type: String, enum: ['admin', 'customer'], default: 'customer' },
}, { timestamps: true });

ReviewSchema.index({ status: 1, createdAt: -1 });
ReviewSchema.index({ status: 1, source: 1, rating: -1 });
ReviewSchema.index({ status: 1, category: 1, createdAt: -1 });
ReviewSchema.index({ featured: 1 });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
