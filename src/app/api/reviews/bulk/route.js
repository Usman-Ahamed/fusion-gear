import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import { authenticateAdmin } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

// Increase body size limit for this route
export const maxDuration = 60; // seconds
export const dynamic = 'force-dynamic';

// POST /api/reviews/bulk - Admin: bulk upload review images
export async function POST(request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const formData = await request.formData();
    const files = formData.getAll('images');

    console.log('Bulk upload: received', files.length, 'files');
    files.forEach((f, i) => console.log(`  File ${i}: name=${f.name}, type=${f.type}, size=${f.size}`));

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // Filter valid image files (lenient - accept any image/* type or common extensions)
    const validFiles = [];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.heic', '.heif', '.tiff'];

    for (const file of files) {
      const name = (file.name || '').toLowerCase();
      const isImageType = file.type?.startsWith('image/');
      const hasImageExt = imageExtensions.some(ext => name.endsWith(ext));
      const hasContent = file.size > 0;

      if ((isImageType || hasImageExt) && hasContent) {
        validFiles.push(file);
      } else {
        console.log(`  Skipping invalid file: ${file.name} (type=${file.type}, size=${file.size})`);
      }
    }

    if (validFiles.length === 0) {
      return NextResponse.json(
        { error: 'No valid image files found. Supported: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Dynamic import for p-limit (ESM module)
    const pLimit = (await import('p-limit')).default;
    const limit = pLimit(3); // 3 concurrent uploads to avoid rate limits

    const results = {
      successful: [],
      failed: [],
    };

    const uploadPromises = validFiles.map((file, index) =>
      limit(async () => {
        try {
          console.log(`  Uploading file ${index + 1}/${validFiles.length}: ${file.name}`);
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const cloudResult = await uploadImage(buffer, 'fusion-gear/reviews');

          const review = await Review.create({
            imageUrl: cloudResult.secure_url,
            publicId: cloudResult.public_id,
            thumbnailUrl: cloudResult.eager?.[0]?.secure_url || cloudResult.secure_url,
            name: 'Happy Customer',
            rating: 5,
            status: 'approved',
            source: 'admin',
          });

          console.log(`  ✅ Uploaded: ${file.name} -> ${review._id}`);

          results.successful.push({
            index,
            fileName: file.name,
            reviewId: review._id,
            imageUrl: cloudResult.secure_url,
          });
        } catch (error) {
          console.error(`  ❌ Failed: ${file.name} ->`, error.message);
          results.failed.push({
            index,
            fileName: file.name,
            error: error.message,
          });
        }
      })
    );

    await Promise.all(uploadPromises);

    console.log(`Bulk upload complete: ${results.successful.length} success, ${results.failed.length} failed`);

    return NextResponse.json({
      success: true,
      message: `Uploaded ${results.successful.length} of ${validFiles.length} images`,
      results,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
