// Single source of truth for public claims, links and categories.
// Edit numbers here; nothing else in the code hard-codes them.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://reviews.fusiongear.lk').replace(/\/$/, '');
export const STORE_URL = 'https://fusiongear.lk';
export const TRACK_URL = 'https://track.fusiongear.lk';
export const INSTAGRAM_URL = 'https://instagram.com/fusiongear.lk';
export const CONTACT_EMAIL = 'fusiongear.lk@gmail.com';
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
export const WHATSAPP_URL = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : null;

// Verifiable business figures. Update when they change.
export const GOOGLE_RATING = {
  value: 4.8,
  url: 'https://g.page/r/CVNgsHrNu9PBEAE',               // Google Business profile
  writeReviewUrl: 'https://g.page/r/CVNgsHrNu9PBEAE/review', // opens "write a review" on Google
};
export const JERSEYS_DELIVERED = 9500; // shown as "9,500+"

export const TAGLINE = "Sri Lanka's #1 jersey plug";

// Review categories, each linked to the matching page on fusiongear.lk.
export const CATEGORIES = [
  { slug: 'club', label: 'Club jerseys', url: `${STORE_URL}/product-category/jerseys/club-jerseys` },
  { slug: 'international', label: 'International', url: `${STORE_URL}/product-category/jerseys/international-jerseys` },
  { slug: 'retro', label: 'Retro', url: `${STORE_URL}/product-category/jerseys/retro-jerseys` },
  { slug: 'world-cup-2026', label: '2026 World Cup', url: `${STORE_URL}/product-category/jerseys/2026-world-cup` },
  { slug: 'kids', label: 'Kids', url: `${STORE_URL}/product-category/jerseys/kids-jerseys` },
  { slug: 'lifestyle', label: 'Lifestyle kits', url: `${STORE_URL}/product-category/lifestyle-kits` },
  { slug: 'tracksuits', label: 'Tracksuits', url: `${STORE_URL}/product-category/tracksuits` },
  { slug: 'other', label: 'Other', url: `${STORE_URL}/product-category/all-products` },
];
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);
export const categoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug) || null;

export const formatCount = (n) => n.toLocaleString('en-US');
