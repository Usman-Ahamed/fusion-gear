import ReviewForm from './ReviewForm';

export const metadata = {
  title: 'Write a review',
  description: 'Got your Fusion Gear jersey? Tell other fans how it looks, fits and feels. Add photos if you can.',
  alternates: { canonical: '/submit-review' },
};

export default function SubmitReviewPage() {
  return (
    <>
      <section className="bg-ink text-paper">
        <div className="container-page py-10 sm:py-14">
          <p className="eyebrow text-muted-dark">Write a review</p>
          <h1 className="mt-2 text-display font-black uppercase">How&apos;s the jersey?</h1>
          <p className="mt-3 max-w-md text-muted-dark">Fit, quality, delivery. Tell other fans what to expect. Takes a minute.</p>
        </div>
      </section>
      <div className="container-page max-w-xl mt-8">
        <ReviewForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null} />
      </div>
    </>
  );
}
