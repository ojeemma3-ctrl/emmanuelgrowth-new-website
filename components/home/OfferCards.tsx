// Example phones for the three problem panels on the home page. Built in code (no images), generic (no brand
// names or logos on the device). Every name and number on the screens is example data; the panel has an
// "Example" caption. The phone is decorative (aria-hidden) with a one-sentence screen-reader description.
import type { ReactNode } from 'react';

function Phone({ tilt, description, children }: { tilt: 'right' | 'left'; description: string; children: ReactNode }) {
  return (
    <div className={`phone-wrap is-${tilt}`}>
      <p className="sr-only">{description}</p>
      <div className="phone" aria-hidden="true">
        <div className="phone-screen">
          <span className="phone-camera" />
          <div className="phone-status">
            <span>9:41</span>
            <span className="phone-icons"><i /><i /><i /><b /></span>
          </div>
          <div className="phone-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

const Stars = () => <span className="ph-stars">★★★★★</span>;

export function FoundCard() {
  return (
    <Phone tilt="right" description="Example: on a phone, a search for “winery near me” shows Château Lumière, open now and rated 4.8, with Call, Directions and Book a tasting buttons.">
      <div className="ph-search">winery near me</div>
      <p className="ph-name">Château Lumière</p>
      <p className="ph-muted">Winery · Open now</p>
      <p className="ph-rating"><b>4.8</b> <Stars /> <span className="ph-muted">(312)</span></p>
      <div className="ph-buttons"><span className="is-dark">Call</span><span>Directions</span><span className="is-wide">Book a tasting</span></div>
    </Phone>
  );
}

const inbox = [
  { initials: 'SM', name: 'Sophie Martin', preview: 'Table for 4 on Saturday?', time: '2m', dot: 'pink' },
  { initials: 'JB', name: 'Julien Bernard', preview: 'Can I change my date?', time: '9m', dot: 'green' },
  { initials: 'LC', name: 'Léa Chevalier', preview: 'Do you ship wine?', time: '24m', dot: 'blue' },
  { initials: 'TR', name: 'Thomas Roy', preview: 'Booking enquiry', time: '1h', dot: 'grey' },
  { initials: 'AM', name: 'Anna M.', preview: 'Asked on Google', time: '2h', dot: 'amber' },
];

export function ConvertCard() {
  return (
    <Phone tilt="left" description="Example: on a phone, one inbox shows five new messages from different channels, including Sophie Martin asking for a table for 4 on Saturday.">
      <div className="ph-inbox-head"><strong>Inbox</strong><span className="ph-muted">5 new</span></div>
      <ul className="ph-inbox">
        {inbox.map((m) => (
          <li key={m.initials}>
            <span className="ph-avatar">{m.initials}<i className={`ph-dot is-${m.dot}`} /></span>
            <span className="ph-conv"><strong>{m.name}</strong><span>{m.preview}</span></span>
            <span className="ph-time">{m.time}</span>
          </li>
        ))}
      </ul>
    </Phone>
  );
}

export function ReviewsCard() {
  return (
    <Phone tilt="right" description="Example: on a phone, a reviews summary for the last 30 days shows an average of 4.8, 27 new reviews and a new five-star review from Claire D.">
      <p className="ph-muted">Reviews · last 30 days</p>
      <div className="ph-tiles">
        <div><span className="ph-muted">Average</span><b>4.8</b></div>
        <div><span className="ph-muted">New reviews</span><b>+27</b></div>
      </div>
      <div className="ph-review">
        <Stars />
        <p>“Lovely tasting and a warm welcome. We booked straight from the message.”</p>
        <span className="ph-muted">Claire D. · Google</span>
      </div>
      <span className="ph-chip">New review received</span>
    </Phone>
  );
}
