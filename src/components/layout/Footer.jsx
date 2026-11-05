import Link from 'next/link';
import Image from 'next/image';
import { CATEGORIES, CONTACT_EMAIL, INSTAGRAM_URL, TAGLINE, TRACK_URL, WHATSAPP_URL } from '@/config/site';
import { storeLink } from '@/lib/links';
import { InstagramIcon, WhatsAppIcon } from '@/components/ui/Icons';

const linkClass = 'inline-block py-1.5 text-sm text-muted-dark hover:text-paper';

export default function Footer() {
  return (
    <footer className="bg-ink text-paper mt-20">
      <div className="container-page py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image src="/logo-96.png" alt="Fusion Gear" width={88} height={48} unoptimized />
          <p className="mt-4 text-sm text-muted-dark max-w-xs">{TAGLINE}. Club, national and retro jerseys, delivered islandwide.</p>
          <div className="mt-5 flex gap-2">
            <a href={INSTAGRAM_URL} className="p-2.5 border border-ink-soft hover:border-paper" aria-label="Fusion Gear on Instagram"><InstagramIcon /></a>
            {WHATSAPP_URL && <a href={WHATSAPP_URL} className="p-2.5 border border-ink-soft hover:border-paper" aria-label="Chat with Fusion Gear on WhatsApp"><WhatsAppIcon /></a>}
          </div>
        </div>

        <nav aria-labelledby="footer-shop">
          <h2 id="footer-shop" className="eyebrow mb-3">Shop</h2>
          <ul>
            {CATEGORIES.filter((c) => c.slug !== 'other').map((c) => (
              <li key={c.slug}><a href={storeLink(c.url, 'footer')} className={linkClass}>{c.label}</a></li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-reviews">
          <h2 id="footer-reviews" className="eyebrow mb-3">Reviews</h2>
          <ul>
            <li><Link href="/reviews" className={linkClass}>All reviews</Link></li>
            <li><Link href="/reviews?photos=1" className={linkClass}>Reviews with photos</Link></li>
            <li><Link href="/submit-review" className={linkClass}>Write a review</Link></li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-help">
          <h2 id="footer-help" className="eyebrow mb-3">Help</h2>
          <ul>
            <li><a href={TRACK_URL} className={linkClass}>Track your order</a></li>
            {WHATSAPP_URL && <li><a href={WHATSAPP_URL} className={linkClass}>WhatsApp us</a></li>}
            <li><a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>{CONTACT_EMAIL}</a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-ink-soft">
        <p className="container-page py-5 text-xs text-muted-dark">© {new Date().getFullYear()} Fusion Gear, Sri Lanka</p>
      </div>
    </footer>
  );
}
