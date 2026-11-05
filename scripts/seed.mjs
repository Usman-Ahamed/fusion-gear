// Create the admin user, or reset its password if it already exists.
// Resetting also signs out every existing admin session.
//
//   npm run seed        (reads ADMIN_EMAIL / ADMIN_PASSWORD from .env.local)
//
// After running it, remove ADMIN_PASSWORD from .env.local again.
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Add it to .env.local');
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) in .env.local');
  process.exit(1);
}

try {
  await mongoose.connect(MONGODB_URI);
  const users = mongoose.connection.db.collection('users');
  const email = ADMIN_EMAIL.toLowerCase().trim();
  const password = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const now = new Date();

  const result = await users.updateOne(
    { email },
    {
      $set: { password, updatedAt: now },
      $inc: { tokenVersion: 1 },
      $setOnInsert: { email, name: 'Fusion Gear Admin', role: 'admin', createdAt: now },
    },
    { upsert: true }
  );

  console.log(result.upsertedCount ? `Admin created: ${email}` : `Password reset for ${email}. All sessions signed out.`);
  await mongoose.disconnect();
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exit(1);
}
