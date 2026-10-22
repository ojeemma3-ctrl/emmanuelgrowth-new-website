// Example cards for the three problem sections on the home page: one calm white card each, built in code.
// Every name and number in them is example data, with an "Example" caption under the card.
// The cards are decorative (aria-hidden); each has a one-sentence screen-reader description.
import type { ReactNode } from 'react';

function CalmFigure({ description, children }: { description: string; children: ReactNode }) {
  return (
    <figure className="calm-figure">
      <p className="sr-only">{description}</p>
      <div className="calm-card" aria-hidden="true">{children}</div>
      <figcaption className="calm-caption">Example</figcaption>
    </figure>
  );
}

export function FoundCard() {
  return (
    <CalmFigure description="Example: a search for “winery near me” shows Château Lumière, open now and rated 4.8, with Call, Directions and Book a tasting buttons.">
      <div className="calm-search">winery near me</div>
      <p className="calm-name">Château Lumière</p>
      <p className="calm-muted">Winery · Open now</p>
      <p className="calm-rating"><b>4.8</b> <span className="calm-stars">★★★★★</span> <span className="calm-muted">(312)</span></p>
      <div className="calm-buttons"><span className="is-dark">Call</span><span>Directions</span><span>Book a tasting</span></div>
    </CalmFigure>
  );
}

export function ConvertCard() {
  return (
    <CalmFigure description="Example: on Instagram, Sophie Martin asks for a table for 4 on Saturday, chooses 21:00 from the times offered and gets a booking confirmation.">
      <div className="calm-head"><strong>Sophie Martin</strong><span className="calm-tag">Instagram</span></div>
      <div className="calm-chat">
        <p className="is-in">Do you have a table for 4 on Saturday?</p>
        <p className="is-out">Yes! 19:30 or 21:00?</p>
        <p className="is-in">21:00 please</p>
        <p className="is-out">Booked. See you Saturday!</p>
      </div>
    </CalmFigure>
  );
}

export function ReviewsCard() {
  return (
    <CalmFigure description="Example: a business rated 4.8 from 312 reviews receives a new five-star review from Claire D. on Google.">
      <div className="calm-rating-big">
        <b>4.8</b>
        <span><span className="calm-stars">★★★★★</span><span className="calm-muted">312 reviews</span></span>
      </div>
      <hr className="calm-divider" />
      <p className="calm-quote">“Lovely tasting and a warm welcome. We booked straight from the message.”</p>
      <p className="calm-muted">Claire D. · Google</p>
      <span className="calm-chip">New review received</span>
    </CalmFigure>
  );
}
