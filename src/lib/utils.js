export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Colombo',
  });
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/** Builds a /reviews URL from the current query plus changes. Changing a filter resets the page. */
export function reviewsHref(query, changes = {}) {
  const next = { ...query, ...changes };
  if (!('page' in changes)) next.page = 1;
  const params = new URLSearchParams();
  if (next.rating) params.set('rating', next.rating);
  if (next.photos) params.set('photos', '1');
  if (next.category) params.set('category', next.category);
  if (next.sort && next.sort !== 'newest') params.set('sort', next.sort);
  if (next.page > 1) params.set('page', next.page);
  const qs = params.toString();
  return qs ? `/reviews?${qs}` : '/reviews';
}
