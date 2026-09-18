import { Arrow } from './shared';

export function Services() {
  return (
    <section className="how-help" id="services">
      <div className="container reveal">
        <p className="kicker">HOW WE HELP</p>
        <div className="intro-grid">
          <h2>Start with the problem you want to fix.</h2>
          <p>You do not need more complicated software. You need a simple system that helps more customers find you, contact you and come back.</p>
        </div>
        <div className="offer-index">
          <a href="#get-found"><span>01</span><strong>Get Found</strong><small>Visibility + lead capture</small><Arrow /></a>
          <a href="#convert"><span>02</span><strong>Convert More Enquiries</strong><small>AI Lead Concierge</small><Arrow /></a>
          <a href="#retain"><span>03</span><strong>Reviews &amp; Customer Follow-Up</strong><small>Trust + repeat business</small><Arrow /></a>
        </div>
      </div>
    </section>
  );
}
