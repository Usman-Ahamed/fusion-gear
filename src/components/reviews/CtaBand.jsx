import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { storeLink } from '@/lib/links';
import { WHATSAPP_URL } from '@/config/site';
import { WhatsAppIcon } from '@/components/ui/Icons';

export default function CtaBand() {
  return (
    <section className="container-page mt-16">
      <div className="bg-ink text-paper p-6 sm:p-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Seen enough? Get yours.</h2>
          <p className="mt-2 text-muted-dark max-w-md">Club, national and retro kits. Delivered islandwide.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href={storeLink(undefined, 'cta_band')} className="btn btn-light">Shop fusiongear.lk <ArrowUpRight size={18} aria-hidden="true" /></a>
          {WHATSAPP_URL && <a href={WHATSAPP_URL} className="btn btn-outline-light"><WhatsAppIcon size={18} /> Ask on WhatsApp</a>}
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Already got your jersey? <Link href="/submit-review" className="font-semibold text-ink underline underline-offset-2">Write a review</Link>
      </p>
    </section>
  );
}
