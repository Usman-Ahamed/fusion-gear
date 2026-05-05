'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, Filter, ChevronDown, X, Calendar, TrendingUp } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import Modal from '@/components/ui/Modal';
import ShareButtons from '@/components/shared/ShareButtons';
import { formatDate } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest', icon: Calendar },
  { value: 'rating', label: 'Top Rated', icon: TrendingUp },
  { value: 'oldest', label: 'Oldest', icon: Calendar },
];

function ReviewCard({ review, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.4 }}
      onClick={() => onClick(review)}
      className="group cursor-pointer rounded-xl overflow-hidden bg-bg-surface border border-border hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={review.thumbnailUrl || review.imageUrl}
          alt={`Review by ${review.name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <StarRating rating={review.rating} size={12} />
          <p className="text-sm font-medium text-white mt-1 truncate">{review.name}</p>
        </div>
        {review.featured && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-gold/90 text-black text-[10px] font-bold rounded-full uppercase tracking-wide">
              Featured
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ReviewModal({ review, onClose }) {
  if (!review) return null;

  return (
    <Modal isOpen={!!review} onClose={onClose}>
      <div className="sm:flex">
        <div className="sm:w-1/2 aspect-square sm:aspect-auto relative">
          <Image
            src={review.imageUrl}
            alt={`Review by ${review.name}`}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="sm:w-1/2 p-6 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-heading font-bold">{review.name}</h3>
              <p className="text-sm text-text-muted">{formatDate(review.createdAt)}</p>
            </div>
            {review.featured && (
              <span className="px-2.5 py-1 bg-gold/20 text-gold text-xs font-semibold rounded-full">
                Featured
              </span>
            )}
          </div>

          <StarRating rating={review.rating} size={20} />

          {review.text && (
            <p className="mt-4 text-text-secondary leading-relaxed flex-1">
              &quot;{review.text}&quot;
            </p>
          )}

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-text-muted mb-2">Share this review</p>
            <ShareButtons url={`/reviews`} title={`${review.name}'s review on Fusion Gear`} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState('latest');
  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Refs for current state in observer callback
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const observerRef = useRef(null);

  const fetchReviews = useCallback(async (pageNum = 1, reset = false) => {
    if (loadingRef.current && pageNum > 1) return;

    try {
      if (pageNum === 1) setLoading(true);
      else {
        setLoadingMore(true);
        loadingRef.current = true;
      }

      const params = new URLSearchParams({
        page: pageNum,
        limit: 20,
        sort,
        ...(search && { search }),
      });

      const res = await fetch(`/api/reviews?${params}`);
      const data = await res.json();

      if (reset || pageNum === 1) {
        setReviews(data.reviews || []);
      } else {
        setReviews(prev => [...prev, ...(data.reviews || [])]);
      }

      const newHasMore = data.pagination?.hasMore || false;
      setHasMore(newHasMore);
      setPage(pageNum);
      hasMoreRef.current = newHasMore;
      pageRef.current = pageNum;
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [sort, search]);

  useEffect(() => {
    fetch('/api/reviews/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    pageRef.current = 1;
    hasMoreRef.current = true;
    loadingRef.current = false;
    fetchReviews(1, true);
  }, [fetchReviews]);

  // Callback ref – fires whenever React mounts/remounts the sentinel div
  const sentinelRef = useCallback((node) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!node) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreRef.current && !loadingRef.current) {
          fetchReviews(pageRef.current + 1);
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );
    observerRef.current.observe(node);
  }, [fetchReviews]);

  const displayCount = Math.max(stats.totalReviews || 0, 1000);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Banner */}
      <section className="relative py-12 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-deeper/30 to-bg-primary" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl sm:text-5xl font-heading font-bold mb-4">
              Customer Reviews
            </h1>
            <p className="text-text-secondary max-w-xl mx-auto mb-8">
              Real feedback from real customers. See why {displayCount}+ people trust Fusion Gear.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 sm:gap-12">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-heading font-bold text-accent">
                  {displayCount}+
                </div>
                <p className="text-sm text-text-muted">Reviews</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-3xl sm:text-4xl font-heading font-bold text-gold">
                  {stats.averageRating || '4.9'}
                  <Star size={24} className="fill-gold text-gold" />
                </div>
                <p className="text-sm text-text-muted">Average</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-heading font-bold text-text-primary">
                  100%
                </div>
                <p className="text-sm text-text-muted">Authentic</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 sm:top-20 z-40 bg-bg-primary/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-bg-surface border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2.5 bg-bg-surface border border-border rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-border-light transition-all"
              >
                <Filter size={14} />
                <span className="hidden sm:inline">
                  {SORT_OPTIONS.find(o => o.value === sort)?.label}
                </span>
                <ChevronDown size={14} />
              </button>

              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-2 w-44 py-1 bg-bg-surface border border-border rounded-xl shadow-xl z-50"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => { setSort(option.value); setShowSortMenu(false); }}
                        className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-colors ${
                          sort === option.value
                            ? 'text-accent bg-accent/10'
                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                        }`}
                      >
                        <option.icon size={14} />
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl skeleton" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-muted text-lg">No reviews found</p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-4 text-accent hover:text-accent-hover text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {reviews.map((review, i) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    onClick={setSelectedReview}
                    index={i}
                  />
                ))}
              </div>

              {/* Sentinel for infinite scroll + manual fallback */}
              {hasMore && (
                <div ref={sentinelRef} className="py-8 flex justify-center">
                  {loadingMore ? (
                    <div className="flex items-center gap-2 text-text-muted text-sm">
                      <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                      Loading more reviews...
                    </div>
                  ) : (
                    <button
                      onClick={() => fetchReviews(pageRef.current + 1)}
                      className="px-6 py-2.5 text-sm text-accent border border-accent/30 rounded-xl hover:bg-accent/10 transition-all"
                    >
                      Load more reviews
                    </button>
                  )}
                </div>
              )}

              {!hasMore && reviews.length > 0 && (
                <p className="text-center text-text-muted text-sm py-8">
                  You&apos;ve seen all {reviews.length} reviews ✨
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Review Modal */}
      <ReviewModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
      />
    </div>
  );
}
