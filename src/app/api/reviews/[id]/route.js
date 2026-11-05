import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import { authenticateAdmin } from '@/lib/auth';
import { deleteImage } from '@/lib/cloudinary';
import { REVIEWS_TAG } from '@/lib/reviews';
import { cleanText, intInRange, isCategory, isObjectId } from '@/lib/validate';

// PATCH /api/reviews/[id] - Admin: moderate / edit a review
export async function PATCH(request, { params }) {
  try {
    if (!(await authenticateAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    if (!isObjectId(id)) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    const set = {};
    const unset = {};
    if ('name' in body) set.name = cleanText(body.name, 60) || 'Happy Customer';
    if ('text' in body) set.text = cleanText(body.text, 1000);
    if ('product' in body) {
      const p = cleanText(body.product, 120);
      if (p) set.product = p; else unset.product = 1;
    }
    if ('category' in body) {
      if (body.category && !isCategory(body.category)) return NextResponse.json({ error: 'Unknown category' }, { status: 400 });
      if (body.category) set.category = body.category; else unset.category = 1;
    }
    if ('rating' in body) {
      const r = intInRange(body.rating, 1, 5);
      if (!r) return NextResponse.json({ error: 'Rating must be 1 to 5' }, { status: 400 });
      set.rating = r;
    }
    if ('status' in body) {
      if (!['pending', 'approved', 'rejected'].includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      set.status = body.status;
    }
    for (const flag of ['featured', 'verified']) {
      if (flag in body) set[flag] = body[flag] === true;
    }

    await dbConnect();
    const review = await Review.findByIdAndUpdate(
      id,
      { ...(Object.keys(set).length && { $set: set }), ...(Object.keys(unset).length && { $unset: unset }) },
      { new: true, runValidators: true }
    ).select('+orderId +contact').lean();
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    revalidateTag(REVIEWS_TAG, 'max');
    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Update review error:', error.message);
    return NextResponse.json({ error: 'Could not update review' }, { status: 500 });
  }
}

// DELETE /api/reviews/[id] - Admin
export async function DELETE(request, { params }) {
  try {
    if (!(await authenticateAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    if (!isObjectId(id)) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    await dbConnect();
    const review = await Review.findByIdAndDelete(id).lean();
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    const publicIds = [review.publicId, ...(review.photos || []).map((p) => p.publicId)].filter(Boolean);
    await Promise.allSettled(publicIds.map(deleteImage));

    revalidateTag(REVIEWS_TAG, 'max');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete review error:', error.message);
    return NextResponse.json({ error: 'Could not delete review' }, { status: 500 });
  }
}
