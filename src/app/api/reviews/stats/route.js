import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';

// GET /api/reviews/stats - Public: get review statistics
export async function GET() {
  try {
    await dbConnect();

    const [stats] = await Review.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          fiveStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] },
          },
          fourStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] },
          },
          threeStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] },
          },
          twoStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] },
          },
          oneStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] },
          },
        },
      },
    ]);

    const pendingCount = await Review.countDocuments({ status: 'pending' });

    const response = NextResponse.json({
      totalReviews: stats?.totalReviews || 0,
      averageRating: Math.round((stats?.averageRating || 0) * 10) / 10,
      distribution: {
        5: stats?.fiveStarCount || 0,
        4: stats?.fourStarCount || 0,
        3: stats?.threeStarCount || 0,
        2: stats?.twoStarCount || 0,
        1: stats?.oneStarCount || 0,
      },
      pendingCount,
    });

    // Stats rarely change — cache aggressively at CDN edge
    // s-maxage=300: fresh for 5 minutes
    // stale-while-revalidate=600: serve stale for up to 10 min while refreshing
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    );

    return response;
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
