import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String },
    thumbnailUrl: { type: String },
  }],
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  price: {
    type: String,
    trim: true,
  },
  websiteUrl: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

ProductSchema.index({ categoryId: 1, createdAt: -1 });
ProductSchema.index({ featured: 1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
