import { SITE_URL } from '@/config/site';
import { getReviewStats, PAGE_SIZE } from '@/lib/reviews';

export const revalidate = 3600;

export default async function sitemap() {
  const { total } = await getReviewStats().catch(() => ({ total: 0 }));
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/reviews`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    ...Array.from({ length: Math.min(pages, 50) - 1 }, (_, i) => ({
      url: `${SITE_URL}/reviews?page=${i + 2}`, lastModified: now, changeFrequency: 'weekly', priority: 0.5,
    })),
    { url: `${SITE_URL}/submit-review`, changeFrequency: 'yearly', priority: 0.4 },
  ];
}
