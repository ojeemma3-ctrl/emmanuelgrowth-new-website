import type { ReactNode } from 'react';
import { ContactTrigger } from './InteractionTriggers';
import { ConvertVisual, FoundVisual, ReviewsVisual } from './OfferVisuals';
import { Arrow } from './shared';

export type Offer = {
  id: string;
  href: string;
  number: string;
  name: string;
  problem: string;
  fix: string;
  bullets: string[];
  details: { title: string; text: string }[];
  visual: ReactNode;
};

export const offers: Offer[] = [
  {
    id: 'get-found',
    href: '/get-found',
    number: '01',
    name: 'Get Found',
    problem: 'Nobody finds me online.',
    fix: 'We make sure local customers can find you, understand what you do in seconds and contact you in one tap.',
    bullets: [
      'A simple website or landing page that explains what you do',
      'Your business details set up clearly so you show up when locals search',
      'Call, WhatsApp and booking buttons on every page',
    ],
    details: [
      { title: 'Google Business Profile', text: 'Set up or improved so you appear when locals search.' },
      { title: 'Website or landing page', text: 'Clear, simple pages that explain what you do.' },
      { title: 'Easy contact', text: 'Call, WhatsApp and contact buttons where people need them.' },
      { title: 'Booking and tracking', text: 'Lead capture, booking and basic tracking so you see what works.' },
    ],
    visual: <FoundVisual />,
  },
  {
    id: 'convert-enquiries',
    href: '/convert-enquiries',
    number: '02',
    name: 'Convert Enquiries',
    problem: 'People message me, then go quiet.',
    fix: 'Every enquiry gets a quick first reply and simple follow-up, so good leads turn into bookings instead of going cold.',
    bullets: [
      'One place for WhatsApp, calls and booking requests',
      'A quick first reply, so nobody waits hours',
      'Simple follow-up until they book',
    ],
    details: [
      { title: 'Fast first replies', text: 'AI-assisted responses so nobody waits hours for an answer.' },
      { title: 'One inbox', text: 'Website and supported messaging channels in one place.' },
      { title: 'Details captured', text: 'The right customer details collected and organised.' },
      { title: 'Booking and handover', text: 'Move enquiries to a booking, or hand over to a person.' },
    ],
    visual: <ConvertVisual />,
  },
  {
    id: 'get-more-reviews',
    href: '/build-trust',
    number: '03',
    name: 'Get More Reviews',
    problem: 'Happy customers don’t leave reviews.',
    fix: 'After each job, customers get a friendly message with one tap to review you, so your reputation grows on its own.',
    bullets: [
      'A review request after every job, by text, WhatsApp or email',
      'One tap straight to your Google or Trustpilot page',
      'A friendly follow-up that brings customers back',
    ],
    details: [
      { title: 'Review requests', text: 'Sent after each job, with Google review follow-up.' },
      { title: 'Review replies', text: 'AI-assisted replies so every review gets a thoughtful answer.' },
      { title: 'Customer follow-up', text: 'Friendly messages that keep past customers coming back.' },
      { title: 'Repeat campaigns', text: 'Simple campaigns across the channels your customers use.' },
    ],
    visual: <ReviewsVisual />,
  },
];

export function OfferPanel({ offer, flipped = false, headingLevel = 'h3' }: { offer: Offer; flipped?: boolean; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  return (
    <div className={`container offer-panel${flipped ? ' is-flipped' : ''}`}>
      <div className="offer-text">
        <p className="offer-number"><span>{offer.number}</span>{offer.name}</p>
        <Heading id={`${offer.id}-title`}>&ldquo;{offer.problem}&rdquo;</Heading>
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
  );
}

export function OfferSections() {
  return (
    <>
      <section className="offers-intro" id="services">
        <div className="container">
          <h2>Three places businesses <em>lose</em> customers.</h2>
        </div>
      </section>
      {offers.map((offer, index) => (
        <section className={`offer-block${index % 2 === 0 ? ' is-grey' : ''}`} id={offer.id} key={offer.id} aria-labelledby={`${offer.id}-title`}>
          <OfferPanel offer={offer} flipped={index % 2 === 1} />
        </section>
      ))}
    </>
  );
}
