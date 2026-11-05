import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  name: { type: String, default: 'Admin' },
  role: { type: String, enum: ['admin'], default: 'admin' },
  // Incremented on password reset; invalidates all existing sessions.
  tokenVersion: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
