import type { ReactNode } from 'react';
import { ConvertCard, FoundCard, ReviewsCard } from './OfferCards';
import { OfferTabs, type OfferTab } from './OfferTabs';

export type Offer = {
  id: string;
  href: string;
  number: string;
  name: string;
  problem: string;
  // Lead, three points and the example graphic. Used by the home page tabs and the service pages.
  home: { fix: string; bullets: string[]; card: ReactNode };
};

export const offers: Offer[] = [
  {
    id: 'get-found',
    href: '/get-found',
    number: '01',
    name: 'Get Found',
    problem: 'Nobody finds me online.',
    home: {
      fix: 'Local customers search, find you and contact you in one tap. Whether you run a winery, a hotel or a restaurant.',
      bullets: [
        'A simple website that shows who you are and what you offer',
        'Your Google profile set up clearly, with photos and opening times',
        'Call, directions and booking buttons on every page',
      ],
      card: <FoundCard />,
    },
  },
  {
    id: 'convert-enquiries',
    href: '/convert-enquiries',
    number: '02',
    name: 'Convert Enquiries',
    problem: 'People message me, then go quiet.',
    home: {
      fix: 'Every message from every channel lands in one inbox, gets a quick first reply and a follow-up until it becomes a booking.',
      bullets: [
        'WhatsApp, Instagram, Facebook, email and SMS in one place',
        'A quick first reply, so nobody waits hours',
        'Simple follow-up until they book',
      ],
      card: <ConvertCard />,
    },
  },
  {
    id: 'get-more-reviews',
    href: '/get-more-reviews',
    number: '03',
    name: 'Get More Reviews',
    problem: 'Happy customers don’t leave reviews.',
    home: {
      fix: 'After each stay, visit or tasting, guests get a friendly message with one tap to review you.',
      bullets: [
        'A review request after every visit, by text, WhatsApp or email',
        'One tap straight to your Google page',
        'See new reviews and your rating in one place',
      ],
      card: <ReviewsCard />,
    },
  },
];

// Home page: one section with a heading, three tabs and one panel (OfferTabs). The service pages reuse the offers data above.
export function OfferSections() {
  const items: OfferTab[] = offers.map((offer) => ({ id: offer.id, number: offer.number, name: offer.name, problem: offer.problem, fix: offer.home.fix, bullets: offer.home.bullets, graphic: offer.home.card }));
  return (
    <section className="offer-tabs-section" id="services" aria-labelledby="services-title">
      <div className="container">
        <div className="ot-heading">
          <h2 id="services-title">Three places to win more customers.</h2>
          <p>Pick one to see how it works.</p>
        </div>
        <OfferTabs items={items} />
      </div>
    </section>
  );
}
