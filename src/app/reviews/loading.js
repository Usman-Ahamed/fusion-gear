export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading reviews">
      <div className="bg-ink">
        <div className="container-page py-10 sm:py-14">
          <div className="h-4 w-40 bg-ink-soft" />
          <div className="mt-4 h-10 w-3/4 max-w-md bg-ink-soft" />
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
            {[0, 1, 2].map((i) => <div key={i} className="h-16 bg-ink-soft" />)}
          </div>
        </div>
      </div>
      <div className="container-page mt-8">
        <div className="flex gap-2">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-10 w-24" />)}</div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton aspect-[4/5]" />)}
        </div>
      </div>
    </div>
  );
}
