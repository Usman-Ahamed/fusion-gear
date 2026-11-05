import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getReviewStats } from '@/lib/reviews';
import { GOOGLE_RATING, JERSEYS_DELIVERED, formatCount } from '@/config/site';

export const alt = 'Fusion Gear customer reviews';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 86400; // refresh the count daily

export default async function OgImage() {
  const [logo, stats] = await Promise.all([
    readFile(join(process.cwd(), 'src/assets/logo-og.png'), 'base64'),
    getReviewStats().catch(() => ({ total: 0 })),
  ]);
  const items = [
    stats.total ? [formatCount(stats.total), 'customer reviews'] : null,
    [`${GOOGLE_RATING.value}/5`, "on Google"],
    [`${formatCount(JERSEYS_DELIVERED)}+`, 'jerseys delivered'],
  ].filter(Boolean);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#0a0a0a', color: '#fff', padding: 72 }}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={`data:image/png;base64,${logo}`} height={110} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 84, fontWeight: 900, letterSpacing: -2, lineHeight: 1, textTransform: 'uppercase' }}>Real fans. Real reviews.</div>
          <div style={{ display: 'flex', gap: 56, marginTop: 48 }}>
            {items.map(([v, l]) => (
              <div key={l} style={{ display: 'flex', flexDirection: 'column', borderLeft: '4px solid #fff', paddingLeft: 20 }}>
                <div style={{ fontSize: 52, fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: 26, color: '#a3a3a3' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
