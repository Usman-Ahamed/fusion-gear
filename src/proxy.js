import { NextResponse } from 'next/server';
import { verifyToken, SESSION_COOKIE } from '@/lib/auth';

// Server-side gate for the admin area. This is an optimistic check
// (signature + expiry). Every admin API route also runs the full
// authenticateAdmin() check against the database.
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === '/admin/login';
  const session = verifyToken(request.cookies.get(SESSION_COOKIE)?.value);

  let response;
  if (!session && !isLogin) {
    response = NextResponse.redirect(new URL('/admin/login', request.url));
  } else if (session && isLogin) {
    response = NextResponse.redirect(new URL('/admin', request.url));
  } else {
    response = NextResponse.next();
  }

  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
