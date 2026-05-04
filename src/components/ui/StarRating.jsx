'use client';

import { Star } from 'lucide-react';

export default function StarRating({ rating = 5, size = 16, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            size={size}
            className={`${
              star <= rating
                ? 'fill-gold text-gold'
                : 'fill-transparent text-border-light'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}
