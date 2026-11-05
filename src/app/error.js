'use client';

import Link from 'next/link';

export default function Error({ reset }) {
  return (
    <div className="container-page py-24 text-center">
      <p className="eyebrow text-muted">Something went wrong</p>
      <h1 className="mt-2 text-2xl font-black uppercase">We couldn&apos;t load this page.</h1>
      <p className="mt-2 text-muted">It&apos;s on our side, not yours. Try again in a moment.</p>
      <div className="mt-8 flex justify-center gap-3">
        <button onClick={reset} className="btn btn-dark">Try again</button>
        <Link href="/" className="btn btn-outline">Go home</Link>
      </div>
    </div>
  );
}
