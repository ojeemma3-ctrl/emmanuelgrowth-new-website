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
        <div className="service-cards">
          <article className="service-card service-card-found">
            <p className="service-card-problem"><em>“Nobody finds me online.”</em></p>
            <h3>Get Found</h3>
            <ul className="service-card-checklist">
              <li><span aria-hidden="true">✓</span>A simple website or landing page that explains what you do</li>
              <li><span aria-hidden="true">✓</span>Your business set up properly so it shows up when locals search</li>
              <li><span aria-hidden="true">✓</span>Call, WhatsApp and booking buttons on every page</li>
            </ul>
            <p className="service-card-outcome">More local customers finding you and getting in touch.</p>
            <a className="button button-light" href="/get-found">Learn more <Arrow /></a>
          </article>
          <article className="service-card service-card-convert">
            <p className="service-card-problem"><em>“People message me, then go quiet.”</em></p>
            <h3>Convert Enquiries</h3>
            <ul className="service-card-checklist">
              <li><span aria-hidden="true">✓</span>One easy place for customers to reach you: WhatsApp, call or booking</li>
              <li><span aria-hidden="true">✓</span>A quick first reply, so nobody waits hours for an answer</li>
              <li><span aria-hidden="true">✓</span>Simple follow-up so enquiries turn into bookings</li>
            </ul>
            <p className="service-card-outcome">Fewer lost enquiries, more booked customers.</p>
            <a className="button button-outline" href="/convert-enquiries">Learn more <Arrow /></a>
          </article>
          <article className="service-card service-card-trust">
            <p className="service-card-problem"><em>“Happy customers don’t leave reviews.”</em></p>
            <h3>Build Trust</h3>
            <ul className="service-card-checklist">
              <li><span aria-hidden="true">✓</span>A review request sent after each job, by text, WhatsApp or email</li>
              <li><span aria-hidden="true">✓</span>One tap takes them straight to your Google or Trustpilot page</li>
              <li><span aria-hidden="true">✓</span>A friendly follow-up message that brings customers back</li>
            </ul>
            <p className="service-card-outcome">More reviews, stronger trust, repeat customers.</p>
            <a className="button button-light" href="/build-trust">Learn more <Arrow /></a>
          </article>
        </div>
      </div>
    </section>
  );
}
