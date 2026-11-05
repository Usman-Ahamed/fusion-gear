import ReviewCard from './ReviewCard';
import { LightboxProvider } from './Lightbox';

// Photo tiles take one column; written reviews span two. grid-flow-dense packs the gaps.
export default function ReviewGrid({ reviews, priorityCount = 2 }) {
  return (
    <LightboxProvider>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 grid-flow-dense">
        {reviews.map((r, i) => (
          <li key={r.id} className={r.isScreenshot && r.photos.length ? 'flex flex-col' : 'col-span-2 flex flex-col'}>
            <ReviewCard review={r} priority={i < priorityCount} />
          </li>
        ))}
      </ul>
    </LightboxProvider>
  );
}
