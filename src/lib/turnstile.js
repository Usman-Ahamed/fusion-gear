import 'server-only';

/** Verifies a Cloudflare Turnstile token. Returns true when Turnstile is not configured. */
export async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token || typeof token !== 'string') return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
