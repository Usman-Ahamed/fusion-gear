import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { reviewsHref } from '@/lib/utils';

function pageWindow(page, pages) {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
}

export default function Pagination({ query, page, pages }) {
  if (pages <= 1) return null;
  const cell = 'flex h-11 min-w-11 items-center justify-center px-2 text-sm font-semibold border border-line';
  return (
    <nav aria-label="Review pages" className="mt-10 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={reviewsHref(query, { page: page - 1 })} className={`${cell} hover:border-ink`} rel="prev" aria-label="Previous page"><ChevronLeft size={18} /></Link>
      ) : <span className={`${cell} text-line`} aria-hidden="true"><ChevronLeft size={18} /></span>}

      {pageWindow(page, pages).map((p) =>
        typeof p === 'string' ? <span key={p} className="px-1 text-muted" aria-hidden="true">…</span> : (
          <Link
            key={p}
            href={reviewsHref(query, { page: p })}
            className={`${cell} ${p === page ? 'bg-ink text-paper border-ink' : 'hover:border-ink'}`}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p}`}
          >{p}</Link>
        )
      )}

      {page < pages ? (
        <Link href={reviewsHref(query, { page: page + 1 })} className={`${cell} hover:border-ink`} rel="next" aria-label="Next page"><ChevronRight size={18} /></Link>
      ) : <span className={`${cell} text-line`} aria-hidden="true"><ChevronRight size={18} /></span>}
    </nav>
  );
}
