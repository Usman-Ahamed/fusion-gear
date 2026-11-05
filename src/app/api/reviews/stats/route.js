import { NextResponse } from 'next/server';
import { getReviewStats } from '@/lib/reviews';

// GET /api/reviews/stats - Public: computed from approved reviews only.
export async function GET() {
  try {
    const stats = await getReviewStats();
    return NextResponse.json(stats, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('Stats error:', error.message);
    return NextResponse.json({ error: 'Could not load stats' }, { status: 500 });
  }
}
