import { whatsappHref } from './content';
import { ContactTrigger } from './InteractionTriggers';
import { Arrow } from './shared';

export function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="container final-cta-panel">
        <p className="kicker">A simple place to start</p>
        <h2>What is your business losing customers to?</h2>
        <p>Tell us what is happening. We will look at how customers find you and contact you, and show you the best place to start.</p>
        <div className="button-row">
          <ContactTrigger className="button button-growth">Get a free visibility check <Arrow /></ContactTrigger>
          <a className="button button-ghost" href={whatsappHref} target="_blank" rel="noreferrer">Message on WhatsApp</a>
        </div>
      </div>
    </section>
  );
}
