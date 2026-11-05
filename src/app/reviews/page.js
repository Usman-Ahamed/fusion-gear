import Link from 'next/link';
import { getCustomerPhotos, getReviews, getReviewStats, parseReviewQuery, PAGE_SIZE } from '@/lib/reviews';
import { categoryBySlug, formatCount, SITE_URL, STORE_URL } from '@/config/site';
import { reviewsHref } from '@/lib/utils';
import ReviewSummary from '@/components/reviews/ReviewSummary';
import ReviewFilters from '@/components/reviews/ReviewFilters';
import ReviewGrid from '@/components/reviews/ReviewGrid';
import PhotoGallery from '@/components/reviews/PhotoGallery';
import Pagination from '@/components/reviews/Pagination';
import CtaBand from '@/components/reviews/CtaBand';
import JsonLd from '@/components/JsonLd';

export async function generateMetadata({ searchParams }) {
  const query = parseReviewQuery(await searchParams);
  const stats = await getReviewStats();
  const isFiltered = query.rating || query.photos || query.category || query.sort !== 'newest';
  const count = formatCount(stats.total);
  return {
    title: query.page > 1 ? `Customer reviews, page ${query.page}` : 'Customer reviews',
    description: `${count} reviews and photos from Fusion Gear customers across Sri Lanka. Real messages, real jerseys.`,
    // Filtered and sorted views point Google at the main list.
    alternates: { canonical: isFiltered ? '/reviews' : reviewsHref({ ...query, sort: 'newest' }, { page: query.page }) },
    robots: isFiltered ? { index: false, follow: true } : undefined,
    openGraph: { title: `${count} Fusion Gear customer reviews`, url: '/reviews' },
  };
}

function EmptyState({ filtered }) {
  return (
    <div className="border border-dashed border-line px-6 py-16 text-center">
      <p className="font-bold">{filtered ? 'No reviews match these filters.' : 'No reviews yet.'}</p>
      <p className="mt-1 text-sm text-muted">{filtered ? 'Try removing a filter.' : 'Be the first to share yours.'}</p>
      <Link href={filtered ? '/reviews' : '/submit-review'} className="btn btn-dark mt-6">
        {filtered ? 'Clear filters' : 'Write a review'}
      </Link>
    </div>
  );
}

function structuredData(stats, reviews) {
  const written = reviews.filter((r) => r.rating && r.text);
  if (!stats.ratedCount) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${STORE_URL}/#organization`,
    name: 'Fusion Gear',
    url: STORE_URL,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: stats.averageRating,
      reviewCount: stats.ratedCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: written.slice(0, 10).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name },
      datePublished: r.createdAt.slice(0, 10),
      reviewBody: r.text,
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
      url: `${SITE_URL}/reviews`,
    })),
  };
}

export default async function ReviewsPage({ searchParams }) {
  const query = parseReviewQuery(await searchParams);
  const [stats, data, photos] = await Promise.all([getReviewStats(), getReviews(query), getCustomerPhotos()]);
  const filtered = Boolean(query.rating || query.photos || query.category);
  const category = categoryBySlug(query.category);
  const ld = structuredData(stats, data.reviews);

  return (
    <>
      {ld && <JsonLd data={ld} />}
      <section className="bg-ink text-paper">
        <div className="container-page pt-10 pb-10 sm:pt-14">
          <p className="eyebrow text-muted-dark">Fusion Gear reviews</p>
          <h1 className="mt-2 text-display sm:text-display-lg font-black uppercase">Straight from the fans.</h1>
          <p className="mt-3 max-w-lg text-muted-dark">Messages and photos from people who ordered from us.</p>
          <div className="mt-8"><ReviewSummary stats={stats} /></div>
        </div>
      </section>

      <div className="container-page">
        {!filtered && query.page === 1 && <PhotoGallery photos={photos} />}

        <div className="sticky top-16 z-20 -mx-4 mt-8 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
          <ReviewFilters query={query} stats={stats} />
        </div>

        <div className="mt-6">
          <p className="mb-4 text-sm text-muted" aria-live="polite">
            {data.total === 0 ? 'No reviews' : `Showing ${formatCount((data.page - 1) * PAGE_SIZE + 1)}–${formatCount((data.page - 1) * PAGE_SIZE + data.reviews.length)} of ${formatCount(data.total)}`}
            {category && ` in ${category.label}`}
            {filtered && <> · <Link href="/reviews" className="font-semibold text-ink underline underline-offset-2">Clear filters</Link></>}
          </p>
          {data.reviews.length ? <ReviewGrid reviews={data.reviews} /> : <EmptyState filtered={filtered} />}
          <Pagination query={query} page={data.page} pages={data.pages} />
        </div>
      </div>

      <CtaBand />
    </>
  );
}
