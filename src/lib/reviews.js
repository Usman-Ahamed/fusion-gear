import 'server-only';
import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import { CATEGORY_SLUGS } from '@/config/site';

export const REVIEWS_TAG = 'reviews';
export const PAGE_SIZE = 12;
const SORTS = ['newest', 'highest', 'photos'];

const APPROVED = { status: 'approved' };
const HAS_PHOTO = { $or: [{ 'photos.0': { $exists: true } }, { imageUrl: { $nin: [null, ''] } }] };
const RATED = { source: 'customer', rating: { $gte: 1 } };

/** Normalises untrusted query params into a safe, canonical filter object. */
export function parseReviewQuery(params = {}) {
  const get = (k) => (Array.isArray(params[k]) ? params[k][0] : params[k]);
  const rating = Number.parseInt(get('rating'), 10);
  const page = Number.parseInt(get('page'), 10);
  return {
    rating: rating >= 1 && rating <= 5 ? rating : null,
    photos: get('photos') === '1',
    category: CATEGORY_SLUGS.includes(get('category')) ? get('category') : null,
    sort: SORTS.includes(get('sort')) ? get('sort') : 'newest',
    page: page >= 1 && page <= 1000 ? page : 1,
  };
}

function buildFilter({ rating, photos, category }) {
  const and = [APPROVED];
  if (rating) and.push({ source: 'customer', rating });
  if (photos) and.push(HAS_PHOTO);
  if (category) and.push({ category });
  return { $and: and };
}

/** Shape sent to the browser. Private fields never leave the server. */
export function toPublicReview(r) {
  const photos = r.photos?.length
    ? r.photos.map(({ url, width, height }) => ({ url, width: width || null, height: height || null }))
    : r.imageUrl ? [{ url: r.imageUrl, width: null, height: null }] : [];
  return {
    id: String(r._id),
    name: r.name || 'Happy Customer',
    text: r.text || '',
    rating: r.source === 'customer' && r.rating ? r.rating : null,
    product: r.product || null,
    category: r.category || null,
    verified: Boolean(r.verified),
    isScreenshot: r.source === 'admin',
    photos,
    createdAt: new Date(r.createdAt).toISOString(),
  };
}

const PUBLIC_FIELDS = 'imageUrl photos name text rating product category verified source createdAt';

export const getReviews = unstable_cache(
  async (query) => {
    await dbConnect();
    const filter = buildFilter(query);
    const sort =
      query.sort === 'highest' ? { rating: -1, createdAt: -1 }
      : query.sort === 'photos' ? { source: -1, createdAt: -1 } // customer photos before screenshots
      : { createdAt: -1 };
    if (query.sort === 'highest') filter.$and.push(RATED);
    if (query.sort === 'photos') filter.$and.push(HAS_PHOTO);

    const [docs, total] = await Promise.all([
      Review.find(filter).select(PUBLIC_FIELDS).sort(sort)
        .skip((query.page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
      Review.countDocuments(filter),
    ]);
    return {
      reviews: docs.map(toPublicReview),
      total,
      page: query.page,
      pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    };
  },
  ['reviews-list'],
  { tags: [REVIEWS_TAG], revalidate: 600 }
);

export const getReviewStats = unstable_cache(
  async () => {
    await dbConnect();
    const [total, withPhotos, ratings, categories] = await Promise.all([
      Review.countDocuments(APPROVED),
      Review.countDocuments({ $and: [APPROVED, HAS_PHOTO] }),
      Review.aggregate([
        { $match: { ...APPROVED, ...RATED } },
        { $group: { _id: '$rating', n: { $sum: 1 } } },
      ]),
      Review.aggregate([
        { $match: { ...APPROVED, category: { $in: CATEGORY_SLUGS } } },
        { $group: { _id: '$category', n: { $sum: 1 } } },
      ]),
    ]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const { _id, n } of ratings) distribution[_id] = n;
    const ratedCount = Object.values(distribution).reduce((a, b) => a + b, 0);
    const ratingSum = Object.entries(distribution).reduce((a, [k, n]) => a + Number(k) * n, 0);

    return {
      total,
      withPhotos,
      ratedCount,
      averageRating: ratedCount ? Math.round((ratingSum / ratedCount) * 10) / 10 : null,
      distribution,
      categoryCounts: Object.fromEntries(categories.map(({ _id, n }) => [_id, n])),
    };
  },
  ['reviews-stats'],
  { tags: [REVIEWS_TAG], revalidate: 600 }
);

export const getFeaturedReviews = unstable_cache(
  async (limit = 8) => {
    await dbConnect();
    let docs = await Review.find({ ...APPROVED, featured: true })
      .select(PUBLIC_FIELDS).sort({ createdAt: -1 }).limit(limit).lean();
    if (docs.length < limit) {
      const more = await Review.find({ ...APPROVED, _id: { $nin: docs.map((d) => d._id) } })
        .select(PUBLIC_FIELDS).sort({ createdAt: -1 }).limit(limit - docs.length).lean();
      docs = docs.concat(more);
    }
    return docs.map(toPublicReview);
  },
  ['reviews-featured'],
  { tags: [REVIEWS_TAG], revalidate: 600 }
);
