import { WHATSAPP_URL } from '@/config/site';
import { WhatsAppIcon } from '@/components/ui/Icons';

export default function WhatsAppButton() {
  if (!WHATSAPP_URL) return null;
  return (
    <a
      href={`${WHATSAPP_URL}?text=${encodeURIComponent('Hi Fusion Gear! I have a question.')}`}
      className="fixed bottom-4 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper shadow-lg ring-2 ring-paper hover:bg-ink-soft"
      aria-label="Chat with us on WhatsApp"
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
