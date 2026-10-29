import Link from 'next/link';
import { CONTACT_TOPICS } from '../../lib/check-config';
import { ContactTrigger } from './InteractionTriggers';
import { Arrow } from './shared';

// heading: each page passes its own. Buttons: the free visibility check, and a free personal review
// (opens the site's contact box with that topic).
export function FinalCTA({ heading = 'See where your business can win more customers.' }: { heading?: string }) {
  return (
    <section className="final-cta">
      <div className="container final-cta-panel">
        <p className="kicker">A simple place to start</p>
        <h2>{heading}</h2>
        <p>Tell me what is happening. I will look at how customers find you and contact you, and show you the best place to start.</p>
        <div className="button-row">
          <Link className="button button-growth" href="/visibility-check">Get a free visibility check <Arrow /></Link>
          <ContactTrigger className="button button-ghost" topic={CONTACT_TOPICS.personalReview}>Get a free personal review</ContactTrigger>
        </div>
      </div>
    </section>
  );
}
