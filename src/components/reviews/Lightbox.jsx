'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const LightboxContext = createContext(null);

/** Wrap any area that contains <PhotoButton>s. Uses native <dialog> for focus trapping and Esc. */
export function LightboxProvider({ children }) {
  const dialogRef = useRef(null);
  const [state, setState] = useState(null); // { photos, index, caption }

  const open = useCallback((photos, index, caption) => {
    setState({ photos, index, caption });
    dialogRef.current?.showModal();
  }, []);
  const close = () => dialogRef.current?.close();
  const step = useCallback((d) => setState((s) => s && { ...s, index: (s.index + d + s.photos.length) % s.photos.length }), []);

  useEffect(() => {
    const onKey = (e) => {
      if (!dialogRef.current?.open) return;
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  const photo = state?.photos[state.index];
  const many = state?.photos.length > 1;

  return (
    <LightboxContext.Provider value={open}>
      {children}
      <dialog
        ref={dialogRef}
        onClose={() => setState(null)}
        onClick={(e) => e.target === dialogRef.current && close()}
        aria-label={state?.caption || 'Photo'}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 text-paper backdrop:bg-ink/80"
      >
        {photo && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <p className="text-sm truncate">{state.caption}{many && ` · ${state.index + 1} of ${state.photos.length}`}</p>
              <button onClick={close} className="p-2 -mr-2" aria-label="Close photo" autoFocus><X size={24} /></button>
            </div>
            <div className="relative flex-1 min-h-0" onClick={close}>
              <Image src={photo.url} alt={state.caption} fill sizes="100vw" className="object-contain" onClick={(e) => e.stopPropagation()} />
            </div>
            {many && (
              <div className="flex justify-center gap-4 py-4">
                <button onClick={() => step(-1)} className="btn btn-outline-light !min-h-11" aria-label="Previous photo"><ChevronLeft size={20} /></button>
                <button onClick={() => step(1)} className="btn btn-outline-light !min-h-11" aria-label="Next photo"><ChevronRight size={20} /></button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </LightboxContext.Provider>
  );
}

export function PhotoButton({ photos, index = 0, caption, className, children }) {
  const open = useContext(LightboxContext);
  return (
    <button type="button" className={className} onClick={() => open?.(photos, index, caption)} aria-label={`View photo: ${caption}`}>
      {children}
    </button>
  );
}
