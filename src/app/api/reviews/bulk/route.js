import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import { authenticateAdmin } from '@/lib/auth';
import { storeReviewPhoto, UploadError } from '@/lib/images';
import { REVIEWS_TAG } from '@/lib/reviews';
import { isCategory } from '@/lib/validate';

export const maxDuration = 60;

// POST /api/reviews/bulk - Admin: upload customer screenshots as approved reviews.
// Screenshots carry no star rating (the customer did not give one here).
export async function POST(request) {
  try {
    if (!(await authenticateAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const form = await request.formData();
    const files = form.getAll('images').filter((f) => typeof f === 'object' && f.size > 0).slice(0, 10);
    const category = form.get('category');
    if (!files.length) return NextResponse.json({ error: 'No images provided' }, { status: 400 });

    await dbConnect();
    const results = { successful: [], failed: [] };
    for (const [index, file] of files.entries()) {
      try {
        const photo = await storeReviewPhoto(file, 'fusion-gear/reviews');
        const review = await Review.create({
          imageUrl: photo.url,
          publicId: photo.publicId,
          photos: [photo],
          name: 'Happy Customer',
          category: isCategory(category) ? category : undefined,
          status: 'approved',
          source: 'admin',
        });
        results.successful.push({ index, fileName: file.name, reviewId: review._id, imageUrl: photo.url });
      } catch (error) {
        results.failed.push({ index, fileName: file.name, error: error instanceof UploadError ? error.message : 'Upload failed' });
        if (!(error instanceof UploadError)) console.error('Bulk upload failed:', error.message);
      }
    }

    if (results.successful.length) revalidateTag(REVIEWS_TAG, 'max');
    return NextResponse.json({
      success: results.successful.length > 0,
      message: `Uploaded ${results.successful.length} of ${files.length}`,
      results,
    });
  } catch (error) {
    console.error('Bulk upload error:', error.message);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
