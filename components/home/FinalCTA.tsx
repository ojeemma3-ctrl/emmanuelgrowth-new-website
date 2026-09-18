import { ContactTrigger } from './InteractionTriggers';
import { Arrow } from './shared';

export function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="container reveal">
        <p className="kicker">A SIMPLE PLACE TO START</p>
        <h2>What is your business losing customers to?</h2>
        <p>Tell us what is happening. We will help you find the best place to start.</p>
        <ContactTrigger className="button button-dark">Get Started <Arrow /></ContactTrigger>
      </div>
    </section>
  );
}
