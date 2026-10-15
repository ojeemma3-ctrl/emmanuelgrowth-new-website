import type { ReactNode } from 'react';
import { ContactTrigger } from './InteractionTriggers';
import { Arrow } from './shared';

type Offer = {
  id: string;
  number: string;
  name: string;
  problem: string;
  fix: string;
  bullets: string[];
  visual: ReactNode;
};

function FoundVisual() {
  return (
    <div className="offer-ui" aria-hidden="true">
      <div className="ui-search"><span>⌕</span>plumber near me</div>
      <div className="ui-card ui-listing">
        <div className="ui-listing-head">
          <span className="ui-logo">Y</span>
          <div><strong>Your Business</strong><small>Plumber · Open now</small></div>
        </div>
        <div className="ui-actions"><span>Call</span><span>WhatsApp</span><span>Book</span></div>
      </div>
      <div className="ui-card ui-float ui-float-right"><span className="ui-dot" />New visitor from local search</div>
    </div>
  );
}

function ConvertVisual() {
  return (
    <div className="offer-ui" aria-hidden="true">
      <div className="ui-card ui-chat">
        <p className="ui-msg ui-msg-in">Hi, can you fit me in this week?</p>
        <p className="ui-msg ui-msg-out">Yes! Here are the free slots. Tap one to book.</p>
        <div className="ui-slots"><span>Tue 10:00</span><span className="is-picked">Wed 14:30</span><span>Fri 09:00</span></div>
      </div>
      <div className="ui-card ui-float ui-float-left"><span className="ui-check">✓</span>Booking confirmed · reminder set</div>
    </div>
  );
}

function ReviewsVisual() {
  return (
    <div className="offer-ui" aria-hidden="true">
      <div className="ui-card ui-chat">
        <p className="ui-msg ui-msg-out">Thanks for choosing us today! Would you leave a quick review?</p>
        <span className="ui-review-button">Leave a review</span>
        <div className="ui-stars">★★★★★</div>
      </div>
      <div className="ui-card ui-float ui-float-right"><span className="ui-dot" />New review received</div>
    </div>
  );
}

const offers: Offer[] = [
  {
    id: 'get-found',
    number: '01',
    name: 'Get Found',
    problem: 'Nobody finds me online.',
    fix: 'We make sure local customers can find you, understand what you do in seconds and contact you in one tap.',
    bullets: [
      'A simple website or landing page that explains what you do',
      'Google Business Profile set up so you show up in local searches',
      'Call, WhatsApp and booking buttons on every page',
    ],
    visual: <FoundVisual />,
  },
  {
    id: 'convert-enquiries',
    number: '02',
    name: 'Convert Enquiries',
    problem: 'People message me, then go quiet.',
    fix: 'Every enquiry gets a quick first reply and simple follow-up, so good leads turn into bookings instead of going cold.',
    bullets: [
      'One place for WhatsApp, calls and booking requests',
      'A quick first reply, so nobody waits hours',
      'Simple follow-up until they book',
    ],
    visual: <ConvertVisual />,
  },
  {
    id: 'get-more-reviews',
    number: '03',
    name: 'Get More Reviews',
    problem: 'Happy customers don’t leave reviews.',
    fix: 'After each job, customers get a friendly message with one tap to review you, so your reputation grows on its own.',
    bullets: [
      'A review request after every job, by text, WhatsApp or email',
      'One tap straight to your Google or Trustpilot page',
      'A friendly follow-up that brings customers back',
    ],
    visual: <ReviewsVisual />,
  },
];

export function OfferSections() {
  return (
    <>
      <section className="offers-intro" id="services">
        <div className="container">
          <h2>Three places businesses lose customers.</h2>
        </div>
      </section>
      {offers.map((offer, index) => (
        <section className="offer-block" id={offer.id} key={offer.id} aria-labelledby={`${offer.id}-title`}>
          <div className={`container offer-panel${index % 2 === 1 ? ' is-flipped' : ''}`}>
            <div className="offer-text">
              <p className="offer-number"><span>{offer.number}</span>{offer.name}</p>
              <h3 id={`${offer.id}-title`}>&ldquo;{offer.problem}&rdquo;</h3>
              <p className="offer-fix">{offer.fix}</p>
              <ul className="offer-bullets">
                {offer.bullets.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
              </ul>
              <ContactTrigger className="button button-dark">Fix this problem <Arrow /></ContactTrigger>
            </div>
            <div className="offer-media">
              <span className="offer-media-label">Example</span>
              {offer.visual}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
