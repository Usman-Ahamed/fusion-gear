import jwt from 'jsonwebtoken';

export const SESSION_COOKIE = 'fg-token';
export const SESSION_MAX_AGE = 12 * 60 * 60; // 12 hours, in seconds

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters long');
  }
  return secret;
}

export function signToken({ userId, tokenVersion }) {
  return jwt.sign({ sub: String(userId), v: tokenVersion ?? 0, role: 'admin' }, getSecret(), {
    algorithm: 'HS256',
    expiresIn: SESSION_MAX_AGE,
  });
}

/** Verifies signature and expiry only. Use authenticateAdmin() for anything that touches data. */
export function verifyToken(token) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getSecret(), { algorithms: ['HS256'] });
    return payload?.role === 'admin' && payload.sub ? payload : null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge,
  };
}

/**
 * Full server-side check: valid signature, user still exists, and the session
 * has not been revoked (password reset bumps tokenVersion).
 * Returns the admin user (lean) or null.
 */
export async function authenticateAdmin(request) {
  const payload = verifyToken(request.cookies?.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  const [{ default: dbConnect }, { default: User }] = await Promise.all([
    import('@/lib/db'),
    import('@/models/User'),
  ]);
  await dbConnect();
  const user = await User.findById(payload.sub).select('email name role tokenVersion').lean();
  if (!user || user.role !== 'admin' || (user.tokenVersion ?? 0) !== payload.v) return null;
  return user;
}
