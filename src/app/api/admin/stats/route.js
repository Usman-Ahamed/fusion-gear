import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { authenticateAdmin } from '@/lib/auth';

// GET /api/admin/stats - Dashboard stats
export async function GET(request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const [
      totalReviews,
      approvedReviews,
      pendingReviews,
      rejectedReviews,
      totalProducts,
      totalCategories,
      avgRating,
      recentReviews,
    ] = await Promise.all([
      Review.countDocuments(),
      Review.countDocuments({ status: 'approved' }),
      Review.countDocuments({ status: 'pending' }),
      Review.countDocuments({ status: 'rejected' }),
      Product.countDocuments(),
      Category.countDocuments(),
      Review.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]),
      Review.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return NextResponse.json({
      totalReviews,
      approvedReviews,
      pendingReviews,
      rejectedReviews,
      totalProducts,
      totalCategories,
      averageRating: Math.round((avgRating[0]?.avg || 0) * 10) / 10,
      recentReviews,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
