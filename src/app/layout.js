import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'Fusion Gear – Sri Lanka\'s #1 Jersey Plug',
  description: 'Premium football jerseys, retro kits, and lifestyle fits. 1000+ verified customer reviews. Sri Lanka\'s most trusted jersey store.',
  keywords: ['jerseys', 'football kits', 'Sri Lanka', 'Fusion Gear', 'retro kits', 'world cup kits'],
  openGraph: {
    title: 'Fusion Gear – Sri Lanka\'s #1 Jersey Plug',
    description: 'Premium football jerseys with 1000+ verified reviews. Shop retro kits, World Cup jerseys & more.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Fusion Gear',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fusion Gear – Sri Lanka\'s #1 Jersey Plug',
    description: 'Premium football jerseys with 1000+ verified reviews.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-body">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #2a2a2a',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
