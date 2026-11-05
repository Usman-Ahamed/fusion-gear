import { preconnect } from 'react-dom';
import { Montserrat } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import JsonLd from '@/components/JsonLd';
import { SITE_URL, STORE_URL, INSTAGRAM_URL, CONTACT_EMAIL } from '@/config/site';

// next/font downloads the font at build time and serves it from this site.
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Fusion Gear Reviews: real customers, real jerseys',
    template: '%s | Fusion Gear Reviews',
  },
  description: "Real reviews and photos from Fusion Gear customers across Sri Lanka. See what lands at their door, then shop at fusiongear.lk.",
  applicationName: 'Fusion Gear Reviews',
  openGraph: { type: 'website', siteName: 'Fusion Gear Reviews', locale: 'en_LK' },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: '#0a0a0a',
};

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${STORE_URL}/#organization`,
  name: 'Fusion Gear',
  url: STORE_URL,
  logo: `${SITE_URL}/logo-96.png`,
  email: CONTACT_EMAIL,
  sameAs: [INSTAGRAM_URL, SITE_URL],
  areaServed: 'LK',
};

export default function RootLayout({ children }) {
  // Review photos come from Cloudinary: open the connection early.
  preconnect('https://res.cloudinary.com'); // no crossOrigin: <img> requests are non-CORS
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="min-h-dvh flex flex-col">
        <JsonLd data={organization} />
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
