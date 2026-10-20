// Example cards for the three problem sections on the home page. Built in code (no images).
// Every name and number in them is example data, shown inside an "Example" card.
// The cards are decorative (aria-hidden); each has a short screen-reader description.
import type { ReactNode } from 'react';

function CardShell({ description, children }: { description: string; children: ReactNode }) {
  return (
    <div className="pc-card">
      <span className="offer-media-label">Example</span>
      <p className="sr-only">{description}</p>
      <div className="pc-stage" aria-hidden="true">{children}</div>
    </div>
  );
}

const Stars = ({ className = 'pc-stars' }: { className?: string }) => <span className={className}>★★★★★</span>;

// Warm sky, sun, hills, converging vine rows and a small farmhouse.
function Vineyard() {
  const rows = Array.from({ length: 15 }, (_, i) => i);
  return (
    <svg className="pc-vineyard" viewBox="0 0 472 132" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="pc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7D9A6" />
          <stop offset="1" stopColor="#F2B98B" />
        </linearGradient>
        <linearGradient id="pc-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6E9B45" />
          <stop offset="1" stopColor="#4F7E33" />
        </linearGradient>
        <clipPath id="pc-field-clip"><path d="M0 84 Q 236 62 472 80 L 472 132 L 0 132 Z" /></clipPath>
      </defs>
      <rect width="472" height="132" fill="url(#pc-sky)" />
      <circle cx="376" cy="34" r="24" fill="#FBE7B8" />
      <path d="M0 74 Q 120 40 250 66 T 472 50 L 472 132 L 0 132 Z" fill="#A9B96E" />
      <path d="M0 82 Q 150 60 300 72 T 472 66 L 472 132 L 0 132 Z" fill="#8FAA5B" />
      <path d="M0 84 Q 236 62 472 80 L 472 132 L 0 132 Z" fill="url(#pc-field)" />
      <g clipPath="url(#pc-field-clip)" stroke="#3E6728" strokeWidth="1.4" opacity=".75">
        {rows.map((i) => <line key={i} x1={236} y1={70} x2={-120 + i * 51} y2={140} />)}
      </g>
      <g transform="translate(58 44)">
        <rect x="2" y="14" width="40" height="22" fill="#F4EEE3" />
        <path d="M-3 15 L22 0 L47 15 Z" fill="#B65A3C" />
        <rect x="18" y="22" width="8" height="14" fill="#7A4A32" />
        <rect x="7" y="20" width="7" height="6" fill="#C9B79C" />
      </g>
    </svg>
  );
}

export function FoundCard() {
  return (
    <CardShell description="Example: a Google search for a winery nearby shows the winery’s listing with its rating and Call, Directions and Book a tasting buttons.">
      <div className="pc-found">
        <div className="pc-search"><span className="pc-search-chip">Google</span><span>winery near me</span></div>
        <div className="pc-result">
          <Vineyard />
          <div className="pc-result-body">
            <strong className="pc-result-name">Château Lumière</strong>
            <span className="pc-muted">Winery · Open now</span>
            <span className="pc-rating"><b>4.8</b><Stars /><span className="pc-muted">(312)</span></span>
            <div className="pc-actions"><span className="is-dark">Call</span><span>Directions</span><span>Book a tasting</span></div>
          </div>
        </div>
        <div className="pc-result-next"><strong>Hôtel Les Quais</strong> · Hotel · 4.7 ★</div>
        <span className="pc-chip is-lime pc-found-chip">Found on Google</span>
      </div>
    </CardShell>
  );
}

const conversations = [
  { initials: 'SM', name: 'Sophie Martin', preview: 'Table for 4 on Sat?', channel: 'instagram', active: true },
  { initials: 'JB', name: 'Julien Bernard', preview: 'Change my date?', channel: 'whatsapp' },
  { initials: 'LC', name: 'Léa Chevalier', preview: 'Do you ship wine?', channel: 'facebook' },
  { initials: 'TR', name: 'Thomas Roy', preview: 'Booking enquiry', channel: 'email' },
  { initials: 'AM', name: 'Anna M.', preview: 'Asked on Google', channel: 'google' },
];

export function ConvertCard() {
  return (
    <CardShell description="Example: one inbox lists messages from Instagram, WhatsApp, Facebook, email and Google. In the open chat, a guest asks for a table for 4 on Saturday, picks 21:00 from the offered times and gets a booking confirmation.">
      <div className="pc-window pc-inbox">
        <div className="pc-list">
          <div className="pc-list-head"><strong>Inbox</strong><span className="pc-muted">5 new</span></div>
          <div className="pc-tabs"><span className="is-on">All</span><span>Unread</span><span>Mine</span></div>
          <ul>
            {conversations.map((c) => (
              <li key={c.initials} className={c.active ? 'is-active' : undefined}>
                <span className="pc-avatar">{c.initials}<i className={`pc-dot is-${c.channel}`} /></span>
                <span className="pc-conv"><strong>{c.name}</strong><span>{c.preview}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <div className="pc-thread">
          <div className="pc-thread-head"><strong>Sophie Martin</strong><span className="pc-tag">Instagram</span></div>
          <div className="pc-messages">
            <p className="pc-msg is-in">Hi! Do you have a table for 4 on Saturday?</p>
            <p className="pc-msg is-out">Yes! Here are the free times. Tap one to book.</p>
            <div className="pc-times"><span>19:30</span><span className="is-picked">21:00</span></div>
            <p className="pc-msg is-in">21:00 please</p>
            <p className="pc-msg is-out">Booked. See you Saturday!</p>
          </div>
        </div>
      </div>
      <div className="pc-chips">
        <span className="pc-chip"><i className="pc-live" />All your messages, one inbox</span>
        <span className="pc-chip is-lime">5 channels</span>
      </div>
    </CardShell>
  );
}

const newReviewBars = [30, 46, 40, 58, 74, 100];
const breakdown = [{ stars: 5, count: 268 }, { stars: 4, count: 31 }, { stars: 3, count: 8 }];

export function ReviewsCard() {
  const top = Math.max(...breakdown.map((b) => b.count));
  return (
    <CardShell description="Example: a reviews dashboard for the last 30 days shows an average rating of 4.8, 27 new reviews, a rating breakdown and the latest five-star review.">
      <div className="pc-window pc-reviews">
        <div className="pc-reviews-head"><strong>Reviews</strong><span className="pc-pill">Last 30 days</span></div>
        <div className="pc-tiles">
          <div className="pc-tile"><span className="pc-muted">Average rating</span><b>4.8</b><Stars /></div>
          <div className="pc-tile"><span className="pc-muted">New reviews</span><b>+27</b>
            <span className="pc-minibars">{newReviewBars.map((h, i) => <i key={i} style={{ height: `${h}%` }} className={i === newReviewBars.length - 1 ? 'is-last' : undefined} />)}</span>
          </div>
        </div>
        <ul className="pc-breakdown">
          {breakdown.map((b) => (
            <li key={b.stars}><span>{b.stars}★</span><span className="pc-track"><i style={{ width: `${Math.max(3, (b.count / top) * 100)}%` }} /></span><span>{b.count}</span></li>
          ))}
        </ul>
        <div className="pc-latest">
          <Stars />
          <p>“Lovely tasting and a warm welcome. We booked straight from the message.”</p>
          <span className="pc-latest-foot"><span>Claire D. · Google</span><span>2 min ago</span></span>
        </div>
      </div>
      <div className="pc-chips">
        <span className="pc-chip"><i className="pc-live" />Request sent</span>
        <span className="pc-chip is-lime">New review received</span>
      </div>
    </CardShell>
  );
}
