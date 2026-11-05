import Image from 'next/image';
import { BadgeCheck } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import { PhotoButton } from './Lightbox';
import { categoryBySlug } from '@/config/site';
import { storeLink } from '@/lib/links';
import { formatDate } from '@/lib/utils';

function Verified() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
      <BadgeCheck size={14} aria-hidden="true" /> Verified buyer
    </span>
  );
}

/** Screenshot of a customer message (uploaded by the team): photo-first tile. */
function ScreenshotCard({ review, priority }) {
  const category = categoryBySlug(review.category);
  const caption = `Customer message, ${formatDate(review.createdAt)}`;
  return (
    <article className="flex-1 flex flex-col border border-line bg-paper">
      <PhotoButton photos={review.photos} caption={caption} className="relative block aspect-[4/5] overflow-hidden bg-mist">
        <Image
          src={review.photos[0].url}
          alt="Screenshot of a message from a Fusion Gear customer"
          fill
          sizes="(min-width: 1024px) 270px, (min-width: 640px) 33vw, 50vw"
          className="object-cover object-top"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
        />
      </PhotoButton>
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-muted">
        <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
        {category && <span className="truncate">{category.label}</span>}
      </div>
    </article>
  );
}

function WrittenCard({ review, priority }) {
  const category = categoryBySlug(review.category);
  const caption = `Photo from ${review.name}`;
  return (
    <article className="flex-1 flex flex-col gap-3 border border-line bg-paper p-4 sm:p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">{review.name}</h3>
          {review.verified && <Verified />}
        </div>
        <time dateTime={review.createdAt} className="shrink-0 text-xs text-muted">{formatDate(review.createdAt)}</time>
      </header>
      {review.rating && <StarRating rating={review.rating} size={18} />}
      {review.text && <p className="text-[0.9375rem] leading-relaxed whitespace-pre-line">{review.text}</p>}
      {(review.product || category) && (
        <p className="text-sm text-muted">
          Bought:{' '}
          {category ? (
            <a href={storeLink(category.url, 'review_card')} className="font-semibold text-ink underline underline-offset-2">
              {review.product || category.label}
            </a>
          ) : <span className="font-semibold text-ink">{review.product}</span>}
        </p>
      )}
      {review.photos.length > 0 && (
        <ul className="flex gap-2" aria-label="Customer photos">
          {review.photos.map((p, i) => (
            <li key={p.url}>
              <PhotoButton photos={review.photos} index={i} caption={caption} className="relative block h-24 w-24 overflow-hidden bg-mist">
                <Image src={p.url} alt={`${caption}, ${i + 1} of ${review.photos.length}`} fill sizes="96px" className="object-cover" loading={priority && i === 0 ? 'eager' : 'lazy'} fetchPriority={priority && i === 0 ? 'high' : 'auto'} />
              </PhotoButton>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function ReviewCard({ review, priority = false }) {
  return review.isScreenshot && review.photos.length > 0
    ? <ScreenshotCard review={review} priority={priority} />
    : <WrittenCard review={review} priority={priority} />;
}
