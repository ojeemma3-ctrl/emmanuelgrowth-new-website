// Small motion graphics for the tabbed problem section on the home page. Built in code (HTML/CSS/SVG).
// Every name and number is example data; the panel has an "Example" caption. Each graphic is aria-hidden
// with a one-sentence screen-reader description.
// Animation: CSS keyframes only. `mg-at-N` makes an element appear in time slot N (700ms apart) of a 9.6s
// loop: 400ms fade and 8px rise, hold, fade out, restart. See the "Motion graphics" block in globals.css.
import type { ReactNode } from 'react';

function Graphic({ description, children }: { description: string; children: ReactNode }) {
  return (
    <>
      <p className="sr-only">{description}</p>
      <div className="mg" aria-hidden="true">{children}</div>
    </>
  );
}

// Small black rounded mark with three lime bars, like the site logo.
const LogoMark = () => (
  <svg className="mg-logo" viewBox="0 0 28 28" width="28" height="28">
    <rect width="28" height="28" rx="7" fill="#0B0C0E" />
    <rect x="7" y="15" width="3.5" height="6" rx="1" fill="#C6F135" />
    <rect x="12.25" y="11" width="3.5" height="10" rx="1" fill="#C6F135" />
    <rect x="17.5" y="7" width="3.5" height="14" rx="1" fill="#C6F135" />
  </svg>
);

const Check = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>
);

export function FoundCard() {
  return (
    <Graphic description="Example: a search for “winery near me” shows Château Lumière, open now and rated 4.8, with Call, Directions and Book buttons, found on Google.">
      <div className="mg-found">
        <div className="mg-search mg-at-0"><span className="mg-typed">winery near me</span></div>
        <div className="mg-card mg-result mg-at-2">
          <p className="mg-title">Château Lumière</p>
          <p className="mg-muted">Winery · Open now</p>
          <p className="mg-rating"><b>4.8</b> <span className="mg-stars">★★★★★</span> <span className="mg-muted">(312)</span></p>
          <div className="mg-pills">
            <span className="is-dark mg-at-3">Call</span>
            <span className="mg-at-4">Directions</span>
            <span className="mg-at-5">Book</span>
          </div>
        </div>
        <span className="mg-chip mg-found-chip mg-at-6">Found on Google</span>
      </div>
    </Graphic>
  );
}

export function ConvertCard() {
  return (
    <Graphic description="Example: a guest asks for a table for 4 on Saturday, the business replies with two times, the guest picks 21:00 and the booking is confirmed.">
      <div className="mg-chat">
        <div className="mg-row is-in mg-at-0"><span className="mg-initials">SM</span><p className="mg-bubble">Table for 4 on Saturday?</p></div>
        <div className="mg-row is-out mg-reply-slot">
          <span className="mg-typing"><i /><i /><i /></span>
          <div className="mg-reply mg-at-2"><p className="mg-bubble is-dark">Yes! 19:30 or 21:00?</p><LogoMark /></div>
        </div>
        <div className="mg-row is-in mg-at-3"><span className="mg-initials">SM</span><p className="mg-bubble">21:00 please</p></div>
        <span className="mg-chip mg-chat-chip mg-at-4">Booked <Check /></span>
      </div>
    </Graphic>
  );
}

const steps = [
  { label: 'Visit completed', icon: <path d="m3.5 8.5 3 3 6-7" /> },
  { label: 'Wait 1 day', icon: <><circle cx="8" cy="8.5" r="5" /><path d="M8 6v2.8l1.8 1.2M6.5 2.5h3" /></> },
  { label: 'Send review request', icon: <><rect x="2.5" y="4" width="11" height="8" rx="1.5" /><path d="m3 5 5 3.5L13 5" /></> },
];

export function ReviewsCard() {
  return (
    <Graphic description="Example: after a visit and a one-day wait, a review request is sent, the guest is thanked and asked for a quick review, and a new five-star review arrives.">
      <div className="mg-flow">
        {steps.map((step, i) => (
          <div className="mg-flow-step" key={step.label}>
            {i > 0 ? <span className={`mg-connector mg-draw-${i * 2 - 1}`} /> : null}
            <div className={`mg-card mg-step mg-at-${i * 2}`}>
              <span className="mg-step-icon"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{step.icon}</svg></span>
              {step.label}
            </div>
          </div>
        ))}
        <div className="mg-reply mg-ask mg-at-5"><LogoMark /><p className="mg-bubble is-dark">Thanks for visiting! Would you leave a quick review?</p></div>
        <div className="mg-review-row">
          <span className="mg-card mg-star-pill mg-at-6">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={`mg-star-${i}`}>★</i>)}</span>
          <span className="mg-chip mg-at-8">New review</span>
        </div>
      </div>
    </Graphic>
  );
}
