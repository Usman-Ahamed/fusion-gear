import Link from 'next/link';
import { ArrowRight, ArrowUpRight, PackageSearch, ShoppingBag, MessageCircle } from 'lucide-react';
import { getFeaturedReviews, getReviewStats } from '@/lib/reviews';
import { formatCount, TAGLINE, TRACK_URL, WHATSAPP_URL } from '@/config/site';
import { storeLink } from '@/lib/links';
import ReviewSummary from '@/components/reviews/ReviewSummary';
import ReviewGrid from '@/components/reviews/ReviewGrid';
import CtaBand from '@/components/reviews/CtaBand';

export async function generateMetadata() {
  const { total } = await getReviewStats();
  return {
    title: { absolute: `Fusion Gear Reviews: ${formatCount(total)} real customer reviews` },
    description: `${formatCount(total)} reviews and photos from Fusion Gear customers. ${TAGLINE}. Shop club, national and retro jerseys at fusiongear.lk.`,
    alternates: { canonical: '/' },
  };
}

const STEPS = [
  { icon: ShoppingBag, title: 'Order on fusiongear.lk', body: 'Pick your kit, size and name. Lock it in with a small deposit.', href: storeLink(undefined, 'how_it_works'), cta: 'Shop now' },
  { icon: PackageSearch, title: 'Track every step', body: 'Use the Order ID from your confirmation email.', href: TRACK_URL, cta: 'Track an order' },
  { icon: MessageCircle, title: 'Real people on WhatsApp', body: 'Sizing, delivery, anything. Ask us before you buy.', href: WHATSAPP_URL, cta: 'Chat with us' },
];

export default async function HomePage() {
  const [stats, reviews] = await Promise.all([getReviewStats(), getFeaturedReviews(8)]);

  return (
    <>
      <section className="bg-ink text-paper">
        <div className="container-page pt-12 pb-12 sm:pt-20 sm:pb-16">
          <p className="eyebrow text-muted-dark">{TAGLINE}</p>
          <h1 className="mt-3 text-display sm:text-display-lg font-black uppercase max-w-3xl">
            Real fans.<br />Real jerseys.<br />Real reviews.
          </h1>
          <p className="mt-4 max-w-md text-muted-dark">
            See what landed at our customers&apos; doors before you order yours.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/reviews" className="btn btn-light">Read {formatCount(stats.total)} reviews <ArrowRight size={18} aria-hidden="true" /></Link>
            <a href={storeLink(undefined, 'home_hero')} className="btn btn-outline-light">Shop fusiongear.lk <ArrowUpRight size={18} aria-hidden="true" /></a>
          </div>
          <div className="mt-12"><ReviewSummary stats={stats} /></div>
        </div>
      </section>

      <section className="container-page mt-12" aria-labelledby="latest-title">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="latest-title" className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Latest from customers</h2>
          <Link href="/reviews" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4">See all <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        {reviews.length ? <ReviewGrid reviews={reviews} /> : <p className="text-muted">Reviews are on their way.</p>}
        <Link href="/reviews" className="btn btn-dark mt-6 w-full sm:w-auto">See all {formatCount(stats.total)} reviews</Link>
      </section>

      <section className="container-page mt-16" aria-labelledby="how-title">
        <h2 id="how-title" className="text-2xl sm:text-3xl font-black uppercase tracking-tight">How ordering works</h2>
        <ol className="mt-6 grid gap-3 md:grid-cols-3">
          {STEPS.filter((s) => s.href).map(({ icon: Icon, title, body, href, cta }, i) => (
            <li key={title} className="border border-line p-5 flex flex-col">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center bg-ink text-paper text-sm font-bold">{i + 1}</span>
                <Icon size={20} aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted flex-1">{body}</p>
              <a href={href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4">{cta} <ArrowUpRight size={14} aria-hidden="true" /></a>
            </li>
          ))}
        </ol>
      </section>

      <CtaBand />
    </>
  );
}
