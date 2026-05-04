import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  publicId: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
  },
  name: {
    type: String,
    default: 'Happy Customer',
    trim: true,
  },
  text: {
    type: String,
    trim: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer',
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
ReviewSchema.index({ status: 1, createdAt: -1 });
ReviewSchema.index({ featured: 1 });
ReviewSchema.index({ rating: -1 });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
