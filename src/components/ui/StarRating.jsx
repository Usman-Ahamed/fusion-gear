// Read-only stars. Server component: ships no JavaScript.
export const STAR_PATH = 'M12 2.5l2.94 6.08 6.56.9-4.78 4.6 1.17 6.52L12 17.5l-5.89 3.1 1.17-6.52-4.78-4.6 6.56-.9L12 2.5z';

export function Star({ size = 16, filled = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <path d={STAR_PATH} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function StarRating({ rating = 0, size = 16 }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} filled={i <= Math.round(rating)} />)}
    </span>
  );
}
