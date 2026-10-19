'use client';

// "Get a free personal review" dialog. Uses the contact from step 1 when it's still in memory;
// after a refresh it asks again, with the consent checkbox. The contact is never saved in the browser.
import { useEffect, useRef, useState } from 'react';
import { OWNER } from '../../lib/check-config';
import { Arrow } from '../home/shared';
import { checkContact, CONTACT_FIELD_IDS, ContactFields, initialContact, withBusinessCountry, type Contact, type ContactState } from './ContactFields';

const errorText: Record<string, string> = {
  expired: 'This check is too old to send. Please message me on WhatsApp instead.',
  busy: 'Too many requests just now. Please try again in a minute.',
  network: 'Your request didn’t go through. Please check your connection and try again.',
  consent: 'Please tick the box so I can contact you about your check.',
  email: 'That email address doesn’t look right. Please check it.',
  whatsapp: 'That WhatsApp number doesn’t look right. Please check it and the country.',
};

const describeContact = (c: Contact) => (c.channel === 'whatsapp' ? `WhatsApp ${c.whatsapp}` : `email ${c.email}`);

export function PersonalReview({ open, onClose, ticket, contact, onContact, businessName, businessCountry, summary }: {
  open: boolean;
  onClose: () => void;
  ticket: string | null;
  contact: Contact | null;
  onContact: (c: Contact) => void;
  businessName: string;
  businessCountry?: string;
  summary: () => { statuses: Record<string, string>; topFixes: string[] };
}) {
  const [state, setState] = useState<'ask' | 'sending' | 'done'>('ask');
  const [error, setError] = useState('');
  const [fields, setFields] = useState<ContactState>(() => withBusinessCountry(initialContact(), businessCountry));
  const [fieldError, setFieldError] = useState<{ field: 'whatsapp' | 'email' | 'consent'; message: string } | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const inFlight = useRef(false);

  // Focus, Escape, a simple focus trap, and focus back to the button that opened the dialog.
  useEffect(() => {
    if (!open) return;
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusables = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button, input, select, textarea, [href]') ?? []).filter((el) => !el.hasAttribute('disabled'));
    window.setTimeout(() => focusables()[0]?.focus(), 0);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const nodes = focusables();
      if (!nodes.length) return;
      if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes[nodes.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === nodes[nodes.length - 1]) { event.preventDefault(); nodes[0].focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = oldOverflow;
      const target = trigger.current;
      window.setTimeout(() => { if (target?.isConnected) target.focus(); }, 0);
    };
  }, [open, onClose]);

  if (!open) return null;

  const request = async () => {
    if (inFlight.current) return;
    setError('');
    let who = contact;
    if (!who) {
      const checked = checkContact(fields);
      if (!checked.ok) {
        setFieldError({ field: checked.field, message: checked.error });
        document.getElementById(CONTACT_FIELD_IDS[checked.field])?.focus();
        return;
      }
      who = checked.contact;
    }
    if (!ticket) { setError(errorText.expired); return; }
    inFlight.current = true;
    setState('sending');
    const res = await fetch('/api/visibility/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket, ...who, consent: true, ...summary() }),
    }).then((r) => r.json() as Promise<{ ok?: boolean; error?: string }>).catch(() => ({ error: 'network' }) as { ok?: boolean; error?: string });
    inFlight.current = false;
    if (res.ok) {
      onContact(who);
      setState('done');
    } else {
      setState('ask');
      setError(errorText[res.error ?? ''] ?? 'Something went wrong. Please try again.');
    }
  };

  const waHref = `https://wa.me/${OWNER.whatsapp}?text=${encodeURIComponent(`Hi ${OWNER.name}, I’ve just requested a personal review for ${businessName}.`)}`;

  return (
    <div className="contact-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="contact-modal ic-review" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="ic-review-title" aria-describedby="ic-review-text">
        <div className="contact-head">
          <h2 id="ic-review-title">{state === 'done' ? 'Thanks, I’ll be in touch' : 'Free personal review'}</h2>
          <button className="icon-button" onClick={onClose} type="button" aria-label="Close">×</button>
        </div>
        {state === 'done' ? (
          <div className="ic-review-body" role="status">
            <p id="ic-review-text">I’ll look at {businessName} and send you what I’d fix first, usually within 2 working days.</p>
            <a className="button button-dark" href={waHref} target="_blank" rel="noreferrer">Message me on WhatsApp <Arrow /></a>
          </div>
        ) : (
          <div className="ic-review-body">
            <p id="ic-review-text">I’ll look at what this tool can’t see (Instagram and social pages, how you handle enquiries, how AI assistants describe you and whether Google lists your pages) and send you what I’d fix first, usually within 2 working days.</p>
            {contact ? (
              <p className="ic-hint">I’ll reach you by {describeContact(contact)}.</p>
            ) : (
              <form className="ic-card ic-form ic-review-form" onSubmit={(e) => { e.preventDefault(); void request(); }} noValidate>
                <ContactFields value={fields} onChange={(next) => { setFields(next); setFieldError(null); }} error={fieldError} />
              </form>
            )}
            {error ? <p className="ic-error" role="alert">{error}</p> : null}
            <button className="button button-growth" type="button" onClick={() => void request()} disabled={state === 'sending'} aria-disabled={state === 'sending'}>
              {state === 'sending' ? 'Sending…' : 'Request my review'} <Arrow />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
