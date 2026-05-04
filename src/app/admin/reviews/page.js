'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, X, Trash2, Star as StarIcon, Eye, Edit3 } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('approved');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedReview, setSelectedReview] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20, status: tab });
      if (search) params.set('search', search);
      const res = await fetch(`/api/reviews?${params}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setPagination(data.pagination || {});
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [tab, search, page]);

  useEffect(() => { setPage(1); }, [tab, search]);
  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const updateReview = async (id, updates) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      toast.success('Review updated');
      fetchReviews();
      setEditingReview(null);
    } catch { toast.error('Failed to update'); }
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Review deleted');
      fetchReviews();
    } catch { toast.error('Failed to delete'); }
  };

  const tabs = [
    { key: 'approved', label: 'Approved' },
    { key: 'pending', label: 'Pending' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all', label: 'All' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Reviews</h1>
        <p className="text-text-muted text-sm mt-1">Manage customer reviews</p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="flex gap-1 bg-bg-surface rounded-xl p-1 border border-border">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}>{t.label}</button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-accent/50 transition-all" />
        </div>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl skeleton" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-text-muted">No reviews found</div>
      ) : (
        <div className="space-y-2">
          {reviews.map((review, i) => (
            <motion.div key={review._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-bg-surface border border-border hover:border-border-light transition-colors"
            >
              <img src={review.thumbnailUrl || review.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 cursor-pointer" onClick={() => setSelectedReview(review)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{review.name}</p>
                  {review.featured && <span className="px-1.5 py-0.5 bg-gold/10 text-gold text-[10px] font-bold rounded">★</span>}
                  <span className="text-xs text-text-muted">{review.source}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating rating={review.rating} size={10} />
                  <span className="text-xs text-text-muted">{formatDate(review.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {review.status === 'pending' && (
                  <>
                    <button onClick={() => updateReview(review._id, { status: 'approved' })} className="p-2 rounded-lg hover:bg-accent/10 text-accent transition-colors" title="Approve"><Check size={16} /></button>
                    <button onClick={() => updateReview(review._id, { status: 'rejected' })} className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors" title="Reject"><X size={16} /></button>
                  </>
                )}
                <button onClick={() => updateReview(review._id, { featured: !review.featured })} className={`p-2 rounded-lg transition-colors ${review.featured ? 'text-gold hover:bg-gold/10' : 'text-text-muted hover:bg-bg-elevated'}`} title="Toggle featured"><StarIcon size={16} /></button>
                <button onClick={() => setSelectedReview(review)} className="p-2 rounded-lg hover:bg-bg-elevated text-text-muted transition-colors" title="View"><Eye size={16} /></button>
                <button onClick={() => deleteReview(review._id)} className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-colors" title="Delete"><Trash2 size={16} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === p ? 'bg-accent text-white' : 'bg-bg-surface text-text-secondary hover:bg-bg-elevated'}`}>{p}</button>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Modal isOpen={!!selectedReview} onClose={() => setSelectedReview(null)}>
        {selectedReview && (
          <div className="sm:flex">
            <div className="sm:w-1/2 aspect-square"><img src={selectedReview.imageUrl} alt="" className="w-full h-full object-cover" /></div>
            <div className="sm:w-1/2 p-6">
              <h3 className="text-xl font-heading font-bold mb-1">{selectedReview.name}</h3>
              <p className="text-sm text-text-muted mb-3">{formatDate(selectedReview.createdAt)}</p>
              <StarRating rating={selectedReview.rating} size={18} />
              {selectedReview.text && <p className="mt-4 text-text-secondary">&quot;{selectedReview.text}&quot;</p>}
              <div className="mt-4 flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${selectedReview.status === 'approved' ? 'bg-accent/10 text-accent' : selectedReview.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'}`}>{selectedReview.status}</span>
                <span className="text-xs text-text-muted">Source: {selectedReview.source}</span>
              </div>
              <div className="mt-6 flex gap-2">
                {selectedReview.status !== 'approved' && (
                  <button onClick={() => { updateReview(selectedReview._id, { status: 'approved' }); setSelectedReview(null); }} className="px-4 py-2 bg-accent text-white text-sm rounded-lg">Approve</button>
                )}
                {selectedReview.status !== 'rejected' && (
                  <button onClick={() => { updateReview(selectedReview._id, { status: 'rejected' }); setSelectedReview(null); }} className="px-4 py-2 bg-error text-white text-sm rounded-lg">Reject</button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
