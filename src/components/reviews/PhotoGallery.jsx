import Image from 'next/image';
import { LightboxProvider, PhotoButton } from './Lightbox';

export default function PhotoGallery({ photos }) {
  if (!photos.length) return null;
  const all = photos.map(({ url, width, height }) => ({ url, width, height }));
  return (
    <section aria-labelledby="gallery-title" className="mt-10">
      <h2 id="gallery-title" className="eyebrow mb-3">Customer photos</h2>
      <LightboxProvider>
        <ul className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
          {photos.map((p, i) => (
            <li key={p.url} className="snap-start shrink-0">
              <PhotoButton photos={all} index={i} caption={p.caption} className="relative block h-28 w-28 sm:h-36 sm:w-36 overflow-hidden bg-mist">
                <Image src={p.url} alt={p.caption} fill sizes="144px" className="object-cover" />
              </PhotoButton>
            </li>
          ))}
        </ul>
      </LightboxProvider>
    </section>
  );
}
