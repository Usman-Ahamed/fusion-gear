import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { storeLink } from '@/lib/links';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-ink text-paper">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-paper focus:text-ink focus:px-4 focus:py-2">
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="shrink-0 py-2" aria-label="Fusion Gear reviews, home">
          <Image src="/logo-96.png" alt="" width={66} height={36} loading="eager" unoptimized />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2 text-[0.8125rem] font-semibold uppercase tracking-wide">
          <Link href="/reviews" className="px-2 py-3 hover:underline underline-offset-4">Reviews</Link>
          <Link href="/submit-review" className="px-2 py-3 hover:underline underline-offset-4">
            <span className="sm:hidden">Write</span><span className="hidden sm:inline">Write a review</span>
          </Link>
          <a href={storeLink()} className="btn btn-light !min-h-10 !px-3 ml-1">
            Shop<span className="hidden sm:inline">&nbsp;fusiongear.lk</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  );
}
