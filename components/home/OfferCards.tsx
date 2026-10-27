// Small motion graphics for the tabbed problem section on the home page. Built in code (HTML/CSS/SVG).
// Every name and number is example data (one invented hotel). Each graphic is aria-hidden
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

// Get Found runs its own longer loop (gf-* keyframes in globals.css): the Google search, then the landing page.
// The tab's progress bar uses this length.
export const FOUND_LOOP_MS = 11200;

export function FoundCard() {
  return (
    <Graphic description="Example: a search for “hotel near me” shows Harbour Hotel in the city centre, rated 4.6 from 1,204 reviews, found on Google. Then its one-page landing page appears: Rooms in the city centre, open every day, free parking, breakfast included, with Call, WhatsApp and Book a room buttons.">
      <div className="mg-found-stage">
        <div className="mg-found mg-phase-search">
          <div className="mg-search gf-s0"><span className="mg-typed gf-typed">hotel near me</span></div>
          <div className="mg-card mg-result gf-s2">
            <p className="mg-title">Harbour Hotel</p>
            <p className="mg-muted">Hotel · City centre</p>
            <p className="mg-rating"><b>4.6</b> <span className="mg-stars">★★★★★</span> <span className="mg-muted">(1,204)</span></p>
            <div className="mg-pills">
              <span className="is-dark gf-s3">Call</span>
              <span className="gf-s4">Directions</span>
              <span className="gf-s5">Book a room</span>
            </div>
          </div>
          <span className="mg-chip mg-found-chip gf-s6">Found on Google</span>
        </div>
        <div className="mg-found mg-phase-page">
          <div className="mg-card mg-lp gf-p0">
            <div className="mg-lp-bar"><i /><i /><i /><span /></div>
            <p className="mg-lp-head">Harbour Hotel</p>
            <div className="mg-lp-body">
              <p className="mg-lp-line">Rooms in the city centre</p>
              <ul className="mg-lp-details">
                <li><Check />Open every day</li>
                <li><Check />Free parking</li>
                <li><Check />Breakfast included</li>
              </ul>
              <div className="mg-pills">
                <span className="is-dark gf-p1">Call</span>
                <span className="gf-p2">WhatsApp</span>
                <span className="gf-p3">Book a room</span>
              </div>
            </div>
          </div>
          <span className="mg-chip mg-found-chip gf-p4">Your landing page</span>
        </div>
      </div>
    </Graphic>
  );
}

export function ConvertCard() {
  return (
    <Graphic description="Example: a guest asks for a room for 2 on Friday, the hotel asks standard or deluxe, the guest picks deluxe and the booking is confirmed.">
      <div className="mg-chat">
        <div className="mg-row is-in mg-at-0"><span className="mg-initials">SM</span><p className="mg-bubble">Do you have a room for 2 on Friday?</p></div>
        <div className="mg-row is-out mg-reply-slot">
          <span className="mg-typing"><i /><i /><i /></span>
          <div className="mg-reply mg-at-2"><p className="mg-bubble is-dark">Yes! Standard or deluxe?</p><LogoMark /></div>
        </div>
        <div className="mg-row is-in mg-at-3"><span className="mg-initials">SM</span><p className="mg-bubble">Deluxe please</p></div>
        <span className="mg-chip mg-chat-chip mg-at-4">Booked <Check /></span>
      </div>
    </Graphic>
  );
}

const steps = [
  { label: 'Stay completed', icon: <path d="m3.5 8.5 3 3 6-7" /> },
  { label: 'Wait 1 day', icon: <><circle cx="8" cy="8.5" r="5" /><path d="M8 6v2.8l1.8 1.2M6.5 2.5h3" /></> },
  { label: 'Send review request', icon: <><rect x="2.5" y="4" width="11" height="8" rx="1.5" /><path d="m3 5 5 3.5L13 5" /></> },
];

export function ReviewsCard() {
  return (
    <Graphic description="Example: after a stay and a one-day wait, a review request is sent, the guest is thanked and asked for a quick review, and a new five-star review arrives.">
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
        <div className="mg-reply mg-ask mg-at-5"><LogoMark /><p className="mg-bubble is-dark">Thanks for staying with us! Would you leave a quick review?</p></div>
        <div className="mg-review-row">
          <span className="mg-card mg-star-pill mg-at-6">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={`mg-star-${i}`}>★</i>)}</span>
          <span className="mg-chip mg-at-8">New review</span>
        </div>
      </div>
    </Graphic>
  );
}
