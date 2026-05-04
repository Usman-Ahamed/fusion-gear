import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not set. Add it to .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true, lowercase: true },
      password: { type: String, required: true },
      name: { type: String, default: 'Admin' },
      role: { type: String, default: 'admin' },
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const email = process.env.ADMIN_EMAIL || 'fusiongear.lk@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'Usmancool@456';

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('⚠️ Admin user already exists:', email);
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.create({
        email,
        password: hashedPassword,
        name: 'Fusion Gear Admin',
        role: 'admin',
      });
      console.log('✅ Admin user created:', email);
    }

    // Seed some default categories
    const CategorySchema = new mongoose.Schema({
      name: { type: String, required: true, unique: true },
      slug: { type: String, required: true, unique: true },
      order: { type: Number, default: 0 },
    }, { timestamps: true });

    const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

    const defaultCategories = [
      { name: 'Retro Kits', slug: 'retro-kits', order: 1 },
      { name: '2026 World Cup Kits', slug: '2026-world-cup-kits', order: 2 },
      { name: 'Lifestyle Fits', slug: 'lifestyle-fits', order: 3 },
      { name: 'Club Jerseys', slug: 'club-jerseys', order: 4 },
      { name: 'National Team Kits', slug: 'national-team-kits', order: 5 },
    ];

    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        console.log(`✅ Category created: ${cat.name}`);
      } else {
        console.log(`⚠️ Category exists: ${cat.name}`);
      }
    }

    console.log('\n🎉 Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
