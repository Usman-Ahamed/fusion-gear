/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    // Review photos are resized by Cloudinary (see src/lib/imageLoader.js),
    // so they don't count against Vercel's image optimisation quota.
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.js',
  },
  async redirects() {
    const rules = [
      // The old products section now lives on the store.
      { source: '/products', destination: 'https://fusiongear.lk/shop', permanent: true },
      { source: '/products/:path*', destination: 'https://fusiongear.lk/shop', permanent: true },
    ];
    // Turn on (set to "true" in Vercel) only after reviews.fusiongear.lk is live,
    // so old fusion-gear.vercel.app links in bios and stories forward to the new domain.
    if (process.env.REDIRECT_VERCEL_DOMAIN === 'true') {
      rules.unshift({
        source: '/:path*',
        has: [{ type: 'host', value: 'fusion-gear.vercel.app' }],
        destination: 'https://reviews.fusiongear.lk/:path*',
        permanent: true,
      });
    }
    return rules;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
        ],
      },
      {
        source: '/logo-96.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
