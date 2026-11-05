'use client';

import { Star } from './StarRating';

const LABELS = ['', 'Poor', 'Not great', 'Good', 'Great', 'Excellent'];

/** Accessible star picker: a native radio group, so arrow keys work. */
export default function StarInput({ value, onChange, name = 'rating', invalid, describedBy }) {
  return (
    <fieldset aria-describedby={describedBy}>
      <legend className="text-sm font-semibold mb-2">Your rating <span className="text-danger">*</span></legend>
      <div className="flex items-center gap-3">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <label key={i} className="cursor-pointer p-1.5 -m-0.5 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent">
              <input
                type="radio" name={name} value={i} checked={value === i}
                onChange={() => onChange(i)} className="sr-only"
              />
              <span className="sr-only">{i} star{i > 1 ? 's' : ''}, {LABELS[i]}</span>
              <Star size={32} filled={i <= value} />
            </label>
          ))}
        </div>
        <span className="text-sm text-muted" aria-hidden="true">{LABELS[value] || ''}</span>
      </div>
    </fieldset>
  );
}
