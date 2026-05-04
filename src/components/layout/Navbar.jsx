'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Star, ShoppingBag, MessageSquare, Shield } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/reviews', label: 'Reviews', icon: Star },
  { href: '/products', label: 'Products', icon: ShoppingBag },
  { href: '/submit-review', label: 'Submit Review', icon: MessageSquare },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bg-primary/90 backdrop-blur-xl border-b border-border shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-accent to-green-dark flex items-center justify-center overflow-hidden group-hover:shadow-lg group-hover:shadow-accent/20 transition-shadow duration-300">
              <span className="text-white font-heading font-bold text-lg sm:text-xl">FG</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-heading font-bold text-text-primary">
                Fusion<span className="text-accent">Gear</span>
              </span>
              <p className="text-[10px] text-text-muted -mt-1 tracking-wider uppercase">
                Sri Lanka&apos;s #1 Jersey Plug
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface rounded-lg transition-all duration-200"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/admin/login"
              className="ml-2 px-4 py-2 text-sm font-medium text-text-muted hover:text-text-secondary rounded-lg transition-colors"
            >
              <Shield size={16} />
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/reviews"
              className="px-5 py-2.5 bg-gradient-to-r from-accent to-green-dark text-white text-sm font-semibold rounded-full hover:shadow-lg hover:shadow-accent/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              View All Reviews
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-surface transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-bg-secondary/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-bg-surface rounded-xl transition-colors"
                >
                  {Icon && <Icon size={18} />}
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
              <div className="pt-3">
                <Link
                  href="/reviews"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-5 py-3 bg-gradient-to-r from-accent to-green-dark text-white font-semibold rounded-xl"
                >
                  View All Reviews
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
