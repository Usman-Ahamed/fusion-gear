import { STORE_URL } from '@/config/site';

/** Adds UTM tags so sales from the reviews site show up in store analytics. */
export function storeLink(url = STORE_URL, campaign = 'reviews_site') {
  const u = new URL(url);
  u.searchParams.set('utm_source', 'reviews.fusiongear.lk');
  u.searchParams.set('utm_medium', 'referral');
  u.searchParams.set('utm_campaign', campaign);
  return u.toString();
}
