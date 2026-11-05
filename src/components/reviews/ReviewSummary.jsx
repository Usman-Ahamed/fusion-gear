import { ArrowUpRight } from 'lucide-react';
import { Star } from '@/components/ui/StarRating';
import { GoogleIcon } from '@/components/ui/Icons';
import { GOOGLE_RATING, JERSEYS_DELIVERED, formatCount } from '@/config/site';

function Stat({ value, label, children }) {
  return (
    <div className="border-l-2 border-paper/30 pl-3">
      <p className="text-2xl sm:text-3xl font-extrabold tabular-nums">{value}</p>
      <p className="mt-1 text-xs sm:text-sm text-muted-dark">{children || label}</p>
    </div>
  );
}

/** Top-of-page proof: real review count, Google rating, orders delivered, and on-site rating breakdown. */
export default function ReviewSummary({ stats }) {
  const { total, ratedCount, averageRating, distribution } = stats;
  const google = (
    <>
      <span className="inline-flex items-center gap-1"><GoogleIcon size={14} /> Google rating</span>
      {GOOGLE_RATING.url && <ArrowUpRight size={12} className="inline ml-0.5" aria-hidden="true" />}
    </>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
      <dl className="grid grid-cols-3 gap-3 sm:gap-6">
        <div><dt className="sr-only">Customer reviews</dt><dd><Stat value={formatCount(total)} label="Customer reviews" /></dd></div>
        <div>
          <dt className="sr-only">Google rating</dt>
          <dd>
            {GOOGLE_RATING.url ? (
              <a href={GOOGLE_RATING.url} className="block hover:opacity-80" aria-label={`${GOOGLE_RATING.value} out of 5 on Google. Read our Google reviews`}>
                <Stat value={<span className="inline-flex items-center gap-1">{GOOGLE_RATING.value}<Star size={20} /></span>}>{google}</Stat>
              </a>
            ) : (
              <Stat value={<span className="inline-flex items-center gap-1">{GOOGLE_RATING.value}<Star size={20} /></span>}>{google}</Stat>
            )}
          </dd>
        </div>
        <div><dt className="sr-only">Jerseys delivered</dt><dd><Stat value={`${formatCount(JERSEYS_DELIVERED)}+`} label="Jerseys delivered" /></dd></div>
      </dl>

      {ratedCount > 0 && (
        <div className="bg-paper text-ink p-4">
          <p className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">{averageRating}</span>
            <span className="text-sm text-muted">from {formatCount(ratedCount)} rating{ratedCount === 1 ? '' : 's'} on this site</span>
          </p>
          <ul className="mt-3 space-y-1.5" aria-label="Rating breakdown">
            {[5, 4, 3, 2, 1].map((n) => {
              const pct = ratedCount ? Math.round((distribution[n] / ratedCount) * 100) : 0;
              return (
                <li key={n} className="flex items-center gap-2 text-sm">
                  <span className="w-8 inline-flex items-center gap-0.5 tabular-nums">{n}<Star size={12} /></span>
                  <span className="h-2 flex-1 bg-mist" aria-hidden="true"><span className="block h-full bg-ink" style={{ width: `${pct}%` }} /></span>
                  <span className="w-10 text-right tabular-nums text-muted">{distribution[n]}</span>
                  <span className="sr-only">{n}-star: {distribution[n]} ({pct}%)</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
