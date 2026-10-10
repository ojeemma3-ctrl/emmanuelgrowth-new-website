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
            <span className="service-card-index">01 / VISIBILITY</span>
            <h3>Get Found</h3>
            <p>Be found by more local customers.</p>
            <a className="button button-light" href="/get-found">Learn more <Arrow /></a>
          </article>
          <article className="service-card service-card-convert">
            <span className="service-card-index">02 / ENQUIRIES</span>
            <h3>Convert Enquiries</h3>
            <p>Turn enquiries into bookings.</p>
            <a className="button button-outline" href="/convert-enquiries">Learn more <Arrow /></a>
          </article>
          <article className="service-card service-card-trust">
            <span className="service-card-index">03 / RETENTION</span>
            <h3>Build Trust</h3>
            <p>Turn good service into lasting trust.</p>
            <a className="button button-light" href="/build-trust">Learn more <Arrow /></a>
          </article>
        </div>
      </div>
    </section>
  );
}
