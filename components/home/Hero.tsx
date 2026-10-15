import { ContactTrigger } from './InteractionTriggers';
import { Arrow } from './shared';

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy hero-reveal">
          <p className="kicker">PRACTICAL MARKETING SYSTEMS FOR REAL BUSINESSES</p>
          <h1>Get found.<br />Convert more enquiries.<br /><em>Get more reviews.</em></h1>
          <p>We help businesses get found online, respond to leads faster and stay connected with their customers.</p>
          <div className="button-row">
            <ContactTrigger className="button button-dark">Get Started</ContactTrigger>
            <a className="button button-outline" href="#services">See Our Services <Arrow /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
