'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Star, ArrowRight, ShieldCheck, Truck, Award, ChevronRight, MessageCircle } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94XXXXXXXXX';

function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const numEnd = Number(end) || 0;
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || numEnd === 0) return;
    let start = 0;
    const step = numEnd / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= numEnd) {
        setCount(numEnd);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, numEnd, duration]);

  // For decimal numbers like ratings, show one decimal place
  const display = numEnd % 1 !== 0 ? (count || numEnd).toFixed(1) : count;

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
}

function ReviewCard({ review, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="min-w-[280px] sm:min-w-[320px] glass-card rounded-2xl overflow-hidden group hover:border-accent/30 transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={review.imageUrl || review.thumbnailUrl}
          alt={`Review by ${review.name}`}
          fill
          sizes="(max-width: 640px) 280px, 320px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <StarRating rating={review.rating} size={14} />
          <p className="text-sm font-semibold text-white mt-1">{review.name}</p>
          {review.text && (
            <p className="text-xs text-text-secondary line-clamp-2 mt-1">{review.text}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0 });
  const [featuredReviews, setFeaturedReviews] = useState([]);

  useEffect(() => {
    fetch('/api/reviews/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});

    fetch('/api/reviews?limit=8&sort=rating&featured=true')
      .then(r => r.json())
      .then(data => setFeaturedReviews(data.reviews || []))
      .catch(() => {});
  }, []);

  const displayReviewCount = Math.max(stats.totalReviews || 0, 1000);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-green-deeper/20 to-bg-primary" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-green-dark/20 rounded-full blur-[120px]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8"
            >
              <ShieldCheck size={16} />
              <span>Sri Lanka&apos;s Most Trusted Jersey Store</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold leading-[1.1] mb-6"
            >
              Worn by Many.
              <br />
              <span className="gradient-text">Loved by all.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Trusted by 10000+ fans worldwide. Consistency, quality, and service you can rely on.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link
                href="/reviews"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-accent to-green-dark text-white font-semibold rounded-full hover:shadow-xl hover:shadow-accent/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                View All Reviews
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-bg-surface border border-border text-text-primary font-semibold rounded-full hover:bg-bg-elevated hover:border-border-light transition-all duration-300"
              >
                Browse Products
              </Link>
            </motion.div>

            {/* Trust Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mx-auto"
            >
              <div className="text-center">
                <div className="text-2xl sm:text-4xl font-heading font-bold text-accent">
                  <AnimatedCounter end={6500} suffix="+" />
                </div>
                <p className="text-xs sm:text-sm text-text-muted mt-1">Kits Delivered</p>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-4xl font-heading font-bold text-gold">
                  <AnimatedCounter end={1000} suffix="+" />
                </div>
                <p className="text-xs sm:text-sm text-text-muted mt-1">Verified Customers</p>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-4xl font-heading font-bold text-text-primary flex items-center justify-center gap-1">
                  <AnimatedCounter end={stats.averageRating || 4.9} suffix="" duration={1000} />
                  <Star size={20} className="fill-gold text-gold sm:w-6 sm:h-6" />
                </div>
                <p className="text-xs sm:text-sm text-text-muted mt-1">Average Rating</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-text-muted flex items-start justify-center p-1.5">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-accent rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Strip */}
      <section className="relative py-6 bg-bg-secondary/50 border-y border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, label: '6500+ Kits Delivered', desc: 'Worn across Sri Lanka' },
              { icon: Award, label: '1000+ Verified Customers', desc: 'Real reviews. Real feedback' },
              { icon: Truck, label: 'Islandwide Delivery', desc: 'Fast. Reliable. Consistent' },
              { icon: MessageCircle, label: 'WhatsApp Support', desc: 'Quick replies. No delays' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <item.icon size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Reviews */}
      {featuredReviews.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <p className="text-accent text-sm font-semibold uppercase tracking-wider mb-2">
                  What Our Customers Say
                </p>
                <h2 className="text-3xl sm:text-4xl font-heading font-bold">
                  Real Reviews, Real People
                </h2>
              </div>
              <Link
                href="/reviews"
                className="hidden sm:flex items-center gap-2 text-accent hover:text-accent-hover font-medium text-sm transition-colors"
              >
                View All <ChevronRight size={16} />
              </Link>
            </motion.div>

            <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
              {featuredReviews.map((review, i) => (
                <div key={review._id} className="snap-start">
                  <ReviewCard review={review} index={i} />
                </div>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 px-6 py-3 bg-bg-surface border border-border rounded-full text-sm font-medium hover:bg-bg-elevated transition-colors"
              >
                View All Reviews <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-dark to-accent p-8 sm:p-14 text-center"
          >
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }}
              />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
                Got Your Jersey? Share Your Experience!
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
                Join our growing community of 10000+ satisfied customers. Your review helps others trust and shop with confidence.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/submit-review"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-green-dark font-bold rounded-full hover:bg-gray-100 transition-colors"
                >
                  Write a Review
                  <ArrowRight size={18} />
                </Link>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-colors"
                >
                  <MessageCircle size={18} />
                  WhatsApp Us
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
