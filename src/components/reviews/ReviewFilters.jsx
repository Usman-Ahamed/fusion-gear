import Link from 'next/link';
import { Camera } from 'lucide-react';
import { Star } from '@/components/ui/StarRating';
import { CATEGORIES } from '@/config/site';
import { reviewsHref } from '@/lib/utils';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'highest', label: 'Top rated' },
  { value: 'photos', label: 'Photos first' },
];

function Chip({ href, active, children, label }) {
  return (
    <Link href={href} className="chip" aria-current={active ? 'true' : undefined} aria-label={label} scroll={false}>
      {children}
    </Link>
  );
}

// Plain links: filters work without JavaScript and every filtered view is a shareable URL.
export default function ReviewFilters({ query, stats }) {
  const usedCategories = CATEGORIES.filter((c) => stats.categoryCounts[c.slug]);
  const hasRatings = stats.ratedCount > 0;

  return (
    <div className="space-y-3">
      <nav aria-label="Sort reviews" className="flex items-center gap-2">
        <span className="eyebrow text-muted shrink-0">Sort</span>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {SORTS.filter((s) => s.value !== 'highest' || hasRatings).map((s) => (
            <Chip key={s.value} href={reviewsHref(query, { sort: s.value })} active={query.sort === s.value}>{s.label}</Chip>
          ))}
        </div>
      </nav>

      <nav aria-label="Filter reviews" className="flex items-center gap-2">
        <span className="eyebrow text-muted shrink-0">Filter</span>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <Chip href={reviewsHref(query, { photos: !query.photos })} active={query.photos}>
            <Camera size={14} aria-hidden="true" /> With photos
          </Chip>
          {hasRatings && [5, 4, 3, 2, 1].filter((n) => stats.distribution[n] > 0).map((n) => (
            <Chip
              key={n}
              href={reviewsHref(query, { rating: query.rating === n ? null : n })}
              active={query.rating === n}
              label={`${n} star reviews`}
            >
              {n}<Star size={12} />
            </Chip>
          ))}
          {usedCategories.map((c) => (
            <Chip key={c.slug} href={reviewsHref(query, { category: query.category === c.slug ? null : c.slug })} active={query.category === c.slug}>
              {c.label}
            </Chip>
          ))}
        </div>
      </nav>
    </div>
  );
}
