import Link from 'next/link';
import { Globe, MessageCircle, Mail, MapPin } from 'lucide-react';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94XXXXXXXXX';

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Fusion Gear" className="h-16 w-auto" />
              <div>
                <span className="text-lg font-heading font-bold">
                  Fusion<span className="text-accent">Gear</span>
                </span>
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              Sri Lanka&apos;s #1 Jersey Plug. Premium football jerseys, retro kits, and lifestyle fits delivered to your doorstep.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/fusiongear.lk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-bg-surface hover:bg-accent/20 flex items-center justify-center text-text-secondary hover:text-accent transition-all"
              >
                <Globe size={18} />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-bg-surface hover:bg-accent/20 flex items-center justify-center text-text-secondary hover:text-accent transition-all"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href="mailto:fusiongear.lk@gmail.com"
                className="w-10 h-10 rounded-lg bg-bg-surface hover:bg-accent/20 flex items-center justify-center text-text-secondary hover:text-accent transition-all"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-text-muted mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/reviews', label: 'Customer Reviews' },
                { href: '/products', label: 'Products' },
                { href: '/submit-review', label: 'Write a Review' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-accent text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-text-muted mb-4">
              Categories
            </h3>
            <ul className="space-y-3">
              {['Retro Kits', 'Club Jerseys', 'World Cup Kits', 'Lifestyle Fits'].map(cat => (
                <li key={cat}>
                  <Link
                    href={`/products?category=${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-text-secondary hover:text-accent text-sm transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-text-muted mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-text-secondary">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>Sri Lanka</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-text-secondary">
                <Mail size={16} className="mt-0.5 shrink-0" />
                <a href="mailto:fusiongear.lk@gmail.com" className="hover:text-accent transition-colors">
                  fusiongear.lk@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-text-secondary">
                <MessageCircle size={16} className="mt-0.5 shrink-0" />
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-accent transition-colors">
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} Fusion Gear. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Sri Lanka&apos;s Most Trusted Jersey Store ⚽
          </p>
        </div>
      </div>
    </footer>
  );
}
