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
            <a className="button button-dark" href="#services">See Our Services <Arrow /></a>
            <ContactTrigger className="button button-outline">Get Started</ContactTrigger>
          </div>
        </div>
        <div className="hero-system hero-reveal" aria-label="Customer journey from being found to becoming a returning customer">
          <div className="hero-system-top"><span>EMMANUEL GROWTH</span><span>ONE SIMPLE SYSTEM</span></div>
          {['Get found', 'Send an enquiry', 'Become a customer', 'Leave feedback', 'Come back'].map((item, index) => <div className="hero-step" key={item}><span>0{index + 1}</span><strong>{item}</strong><i aria-hidden="true" /></div>)}
          <p>Find the gap. Fix the journey. Keep it simple.</p>
        </div>
      </div>
    </section>
  );
}
