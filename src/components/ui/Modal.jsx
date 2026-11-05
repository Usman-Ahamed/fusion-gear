'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/** Native <dialog>: focus trap, Esc to close and inert background for free. */
export default function Modal({ isOpen, onClose, children, label = 'Dialog' }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto border border-line bg-paper p-0 text-ink backdrop:bg-ink/70"
    >
      <button onClick={onClose} className="absolute right-3 top-3 z-10 bg-paper p-2" aria-label="Close">
        <X size={20} />
      </button>
      {isOpen && children}
    </dialog>
  );
}
