'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Camera, CheckCircle2, Loader2, X } from 'lucide-react';
import StarInput from '@/components/ui/StarInput';
import { CATEGORIES } from '@/config/site';
import { compressImage } from '@/lib/compressImage';

const MAX_PHOTOS = 3;

function Field({ id, label, hint, error, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1.5">
        {label} {required ? <span className="text-danger" aria-hidden="true">*</span> : <span className="font-normal text-muted">(optional)</span>}
      </label>
      {hint && <p id={`${id}-hint`} className="-mt-1 mb-1.5 text-xs text-muted">{hint}</p>}
      {children}
      {error && <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}

export default function ReviewForm({ turnstileSiteKey }) {
  const uid = useId();
  const formRef = useRef(null);
  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState([]); // { file, url }
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [message, setMessage] = useState('');

  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), [photos]);

  async function addPhotos(e) {
    const picked = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - photos.length);
    e.target.value = '';
    const compressed = await Promise.all(picked.map(compressImage));
    setPhotos((cur) => [...cur, ...compressed.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
    setErrors((cur) => ({ ...cur, photos: undefined }));
  }

  function removePhoto(i) {
    setPhotos((cur) => cur.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(formRef.current);
    fd.delete('photo-picker');
    photos.forEach((p) => fd.append('photos', p.file));

    const local = {};
    if ((fd.get('name') || '').trim().length < 2) local.name = 'Add your name';
    if (!rating) local.rating = 'Pick a star rating';
    if ((fd.get('text') || '').trim().length < 10) local.text = 'Write at least a sentence (10+ characters)';
    if (fd.get('orderId') && !fd.get('contact')) local.contact = 'Add the phone or email used for the order';
    setErrors(local);
    if (Object.keys(local).length) {
      setMessage('Check the highlighted fields.');
      formRef.current.querySelector(`[name="${Object.keys(local)[0]}"]`)?.focus();
      return;
    }

    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch('/api/reviews', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.fields || {});
        setMessage(data.error || 'Could not send your review. Try again.');
        setStatus('idle');
        window.turnstile?.reset();
        return;
      }
      setStatus('done');
      window.scrollTo({ top: 0 });
    } catch {
      setMessage('No connection. Check your internet and try again.');
      setStatus('idle');
    }
  }

  if (status === 'done') {
    return (
      <div className="border border-line p-8 text-center" role="status">
        <CheckCircle2 size={40} className="mx-auto text-accent" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-black uppercase">Thanks, got it!</h2>
        <p className="mt-2 text-muted">We check every review before it goes live. Yours should appear within a day or two.</p>
        <Link href="/reviews" className="btn btn-dark mt-6">Read other reviews</Link>
      </div>
    );
  }

  const ids = (k) => ({ id: `${uid}-${k}`, 'aria-invalid': errors[k] ? true : undefined, 'aria-describedby': errors[k] ? `${uid}-${k}-error` : undefined });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6">
      {turnstileSiteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />}

      <div>
        <StarInput value={rating} onChange={(v) => { setRating(v); setErrors((c) => ({ ...c, rating: undefined })); }} invalid={!!errors.rating} describedBy={errors.rating ? `${uid}-rating-error` : undefined} />
        <input type="hidden" name="rating" value={rating || ''} />
        {errors.rating && <p id={`${uid}-rating-error`} className="mt-1.5 text-sm text-danger">{errors.rating}</p>}
      </div>

      <Field id={`${uid}-text`} label="Your review" required error={errors.text}>
        <textarea name="text" rows={5} maxLength={1000} className="field" placeholder="How was the fit, quality and delivery?" {...ids('text')} />
      </Field>

      <Field id={`${uid}-name`} label="Your name" required error={errors.name} hint="Shown with your review. First name is fine.">
        <input name="name" maxLength={60} autoComplete="given-name" className="field" {...ids('name')} aria-describedby={[`${uid}-name-hint`, errors.name && `${uid}-name-error`].filter(Boolean).join(' ')} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={`${uid}-product`} label="What did you buy?" error={errors.product}>
          <input name="product" maxLength={120} className="field" placeholder="e.g. Arsenal 25/26 home" {...ids('product')} />
        </Field>
        <Field id={`${uid}-category`} label="Category" error={errors.category}>
          <select name="category" className="field" defaultValue="" {...ids('category')}>
            <option value="">Choose one</option>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
        </Field>
      </div>

      <div>
        <p className="block text-sm font-semibold mb-1.5">Photos <span className="font-normal text-muted">(optional, up to {MAX_PHOTOS})</span></p>
        <p className="-mt-1 mb-2 text-xs text-muted">Photos of you in the jersey help other fans the most.</p>
        <div className="flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <div key={p.url} className="relative h-24 w-24 bg-mist">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
              <img src={p.url} alt={`Selected photo ${i + 1}`} className="h-full w-full object-cover" />
              <button type="button" onClick={() => removePhoto(i)} className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-paper" aria-label={`Remove photo ${i + 1}`}>
                <X size={16} />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed border-line text-xs font-semibold text-muted hover:border-ink hover:text-ink has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent">
              <Camera size={22} aria-hidden="true" />
              Add photo
              <input name="photo-picker" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} className="sr-only" aria-describedby={errors.photos ? `${uid}-photos-error` : undefined} />
            </label>
          )}
        </div>
        {errors.photos && <p id={`${uid}-photos-error`} className="mt-1.5 text-sm text-danger">{errors.photos}</p>}
      </div>

      <details className="border border-line p-4 group" open={!!(errors.orderId || errors.contact)}>
        <summary className="cursor-pointer font-semibold">Get a <span className="text-accent">Verified buyer</span> badge</summary>
        <p className="mt-2 text-sm text-muted">Add the Order ID from your confirmation email. We check it against our records. It&apos;s never shown publicly.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id={`${uid}-orderId`} label="Order ID" error={errors.orderId}>
            <input name="orderId" maxLength={40} className="field" placeholder="e.g. ORD001" autoCapitalize="characters" {...ids('orderId')} />
          </Field>
          <Field id={`${uid}-contact`} label="Phone or email on the order" error={errors.contact}>
            <input name="contact" maxLength={120} className="field" autoComplete="tel" {...ids('contact')} />
          </Field>
        </div>
      </details>

      {/* Honeypot: hidden from people, bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>Company <input name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {turnstileSiteKey && <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light" data-size="flexible" />}

      {message && <p role="alert" className="border-l-4 border-danger bg-[#fdf2f1] px-4 py-3 text-sm">{message}</p>}

      <button type="submit" disabled={status === 'sending'} className="btn btn-dark w-full disabled:opacity-60">
        {status === 'sending' ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Sending…</> : 'Send review'}
      </button>
      <p className="text-xs text-muted text-center">We read every review before publishing. Your Order ID and contact stay private.</p>
    </form>
  );
}
