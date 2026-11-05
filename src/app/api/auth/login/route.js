import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken, sessionCookieOptions, SESSION_COOKIE } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Hash of a random string: compared against when the email is unknown,
// so response time does not reveal which emails exist.
const DUMMY_HASH = '$2b$12$SHSLIm/A4Hm2Yk03yv2CL.w4OBBE9P/czMssGqUG9f.cTb9S2gzDS';
const INVALID = { error: 'Invalid email or password' };

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim().slice(0, 200) : '';
    const password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const ip = getClientIp(request);
    const [ipOk, emailOk] = await Promise.all([
      rateLimit(`login:ip:${ip}`, 5, 15 * 60 * 1000),
      rateLimit(`login:email:${email}`, 10, 60 * 60 * 1000),
    ]);
    if (!ipOk || !emailOk) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again in 15 minutes.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    await dbConnect();
    const user = await User.findOne({ email }).select('+password').lean();
    const isMatch = await bcrypt.compare(password, user?.password || DUMMY_HASH);
    if (!user || !isMatch || user.role !== 'admin') {
      return NextResponse.json(INVALID, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(
      SESSION_COOKIE,
      signToken({ userId: user._id, tokenVersion: user.tokenVersion ?? 0 }),
      sessionCookieOptions()
    );
    return response;
  } catch (error) {
    console.error('Login error:', error.message);
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
