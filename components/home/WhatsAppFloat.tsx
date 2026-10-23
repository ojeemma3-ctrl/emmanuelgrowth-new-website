import { OWNER } from '../../lib/check-config';

// The WhatsApp number comes from one setting only: OWNER.whatsapp in lib/check-config.ts
// (international digits, no plus sign). If it is empty, nothing is shown.
const MESSAGE = 'Hi, I would like a free personal review.';
export const whatsappReviewHref = OWNER.whatsapp ? `https://wa.me/${OWNER.whatsapp}?text=${encodeURIComponent(MESSAGE)}` : null;

// Small round button, phones only (hidden from 768px up). CSS hides it while the cookie banner, the mobile
// menu or the contact box is open, and on the visibility check form step, so it never covers buttons there.
export function WhatsAppFloat() {
  if (!whatsappReviewHref) return null;
  return (
    <a className="wa-float" href={whatsappReviewHref} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
        <path d="M12 3.2a8.7 8.7 0 0 0-7.5 13.1L3.3 20.7l4.5-1.2A8.7 8.7 0 1 0 12 3.2Z" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9.2 7.9c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .5-.1.7l-.5.6c.5 1 1.3 1.8 2.3 2.3l.6-.5c.2-.1.5-.2.7-.1l1.4.6c.3.1.4.3.4.5v.5c0 .3-.1.6-.5.8-.6.3-1.4.5-2.2.1-2.1-.8-3.7-2.4-4.5-4.5-.4-.8-.2-1.6.1-2.2Z" fill="#FFFFFF" />
      </svg>
    </a>
  );
}
