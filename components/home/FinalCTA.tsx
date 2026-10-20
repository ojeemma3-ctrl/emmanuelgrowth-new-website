import { whatsappHref } from './content';
import Link from 'next/link';
import { Arrow } from './shared';

// heading: the home page passes its own; the service pages keep the default.
export function FinalCTA({ heading }: { heading?: string }) {
  return (
    <section className="final-cta">
      <div className="container final-cta-panel">
        <p className="kicker">A simple place to start</p>
        <h2>{heading ?? <>What is your business <em>losing</em> customers to?</>}</h2>
        <p>Tell us what is happening. We will look at how customers find you and contact you, and show you the best place to start.</p>
        <div className="button-row">
          <Link className="button button-growth" href="/visibility-check">Get a free visibility check <Arrow /></Link>
          <a className="button button-ghost" href={whatsappHref} target="_blank" rel="noreferrer">Message on WhatsApp</a>
        </div>
      </div>
    </section>
  );
}
