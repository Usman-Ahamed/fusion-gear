'use client';

import { Share2, Copy, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShareButtons({ url, title = 'Check out Fusion Gear!' }) {
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success('Link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${fullUrl}`)}`,
      '_blank'
    );
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
      } catch {
        // User cancelled
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={shareWhatsApp}
        className="p-2 rounded-lg bg-bg-surface hover:bg-green-dark/30 text-text-secondary hover:text-accent transition-all"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle size={18} />
      </button>
      <button
        onClick={copyLink}
        className="p-2 rounded-lg bg-bg-surface hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-all"
        aria-label="Copy link"
      >
        <Copy size={18} />
      </button>
      <button
        onClick={shareNative}
        className="p-2 rounded-lg bg-bg-surface hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-all"
        aria-label="Share"
      >
        <Share2 size={18} />
      </button>
    </div>
  );
}
