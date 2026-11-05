import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import { authenticateAdmin } from '@/lib/auth';

// GET /api/admin/stats - Dashboard numbers
export async function GET(request) {
  try {
    if (!(await authenticateAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();

    const [byStatus, recentReviews] = await Promise.all([
      Review.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
      Review.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    const count = Object.fromEntries(byStatus.map(({ _id, n }) => [_id, n]));

    return NextResponse.json(
      {
        totalReviews: (count.approved || 0) + (count.pending || 0) + (count.rejected || 0),
        approvedReviews: count.approved || 0,
        pendingReviews: count.pending || 0,
        rejectedReviews: count.rejected || 0,
        recentReviews,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Admin stats error:', error.message);
    return NextResponse.json({ error: 'Could not load stats' }, { status: 500 });
  }
}
