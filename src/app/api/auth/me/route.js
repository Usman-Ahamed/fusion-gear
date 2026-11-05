import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await authenticateAdmin(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ user: { email: user.email, name: user.name } });
  } catch (error) {
    console.error('Auth check error:', error.message);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
