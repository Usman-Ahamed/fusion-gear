'use client';

import { useEffect, useState } from 'react';
import { Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl skeleton" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Reviews', value: stats?.totalReviews || 0, icon: Star, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Approved', value: stats?.approvedReviews || 0, icon: CheckCircle, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Pending', value: stats?.pendingReviews || 0, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Rejected', value: stats?.rejectedReviews || 0, icon: XCircle, color: 'text-error', bg: 'bg-error/10' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Welcome back to Fusion Gear admin</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
           
           
           
            className="p-5 rounded-2xl bg-bg-surface border border-border hover:border-border-light transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={18} className={stat.color} />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Reviews */}
      {stats?.recentReviews?.length > 0 && (
        <div className="rounded-2xl bg-bg-surface border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-heading font-semibold">Recent Reviews</h2>
          </div>
          <div className="divide-y divide-border">
            {stats.recentReviews.map(review => (
              <div key={review._id} className="flex items-center gap-4 px-5 py-3">
                <img src={review.photos?.[0]?.url || review.thumbnailUrl || review.imageUrl || "/logo.png"} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{review.name}</p>
                  <p className="text-xs text-text-muted">{formatDate(review.createdAt)}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  review.status === 'approved' ? 'bg-accent/10 text-accent' :
                  review.status === 'pending' ? 'bg-warning/10 text-warning' :
                  'bg-error/10 text-error'
                }`}>{review.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
