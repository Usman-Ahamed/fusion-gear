import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="eyebrow text-muted">404</p>
      <h1 className="mt-2 text-2xl font-black uppercase">Off the pitch.</h1>
      <p className="mt-2 text-muted">This page doesn&apos;t exist.</p>
      <Link href="/reviews" className="btn btn-dark mt-8">See reviews</Link>
    </div>
  );
}
