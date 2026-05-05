import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import { authenticateAdmin } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import { checkRateLimit } from '@/lib/utils';

// GET /api/reviews - Public: get approved reviews, Admin: get all
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const sort = searchParams.get('sort') || 'latest';
    const status = searchParams.get('status') || 'approved';
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured');

    // Only check admin auth when status param is explicitly set (admin panel use case)
    // This skips JWT parsing overhead for regular public visitors
    const admin = status !== 'approved' ? await authenticateAdmin(request) : null;

    const query = {};

    // Non-admin can only see approved reviews
    if (!admin) {
      query.status = 'approved';
    } else if (status !== 'all') {
      query.status = status;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { text: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'rating') {
      sortOption = { rating: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
      Review.countDocuments(query),
    ]);

    const response = NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + reviews.length < total,
      },
    });

    // Cache public responses at Vercel CDN edge
    // s-maxage=60: CDN serves cached response for 60 seconds
    // stale-while-revalidate=300: serve stale for up to 5 min while refreshing in background
    if (!admin) {
      response.headers.set(
        'Cache-Control',
        'public, s-maxage=60, stale-while-revalidate=300'
      );
    }

    return response;
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reviews - Public: submit a review (goes to pending)
export async function POST(request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip, 3, 86400000)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    await dbConnect();

    const formData = await request.formData();
    const name = formData.get('name') || 'Happy Customer';
    const text = formData.get('text') || '';
    const rating = parseInt(formData.get('rating')) || 5;
    const imageFile = formData.get('image');

    if (!imageFile) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Validate image
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Upload to Cloudinary
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await uploadImage(buffer, 'fusion-gear/reviews');

    const review = await Review.create({
      imageUrl: result.secure_url,
      publicId: result.public_id,
      thumbnailUrl: result.eager?.[0]?.secure_url || result.secure_url,
      name: name.substring(0, 100),
      text: text.substring(0, 500),
      rating: Math.min(5, Math.max(1, rating)),
      status: 'pending',
      source: 'customer',
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted! It will appear after admin approval.',
      review,
    }, { status: 201 });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
