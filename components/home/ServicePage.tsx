import Link from 'next/link';
import { FAQ } from './FAQ';
import { FinalCTA } from './FinalCTA';
import { HowItWorks } from './HowItWorks';
import { OfferPanel, offers } from './OfferSections';
import { Pricing } from './Pricing';
import { Arrow } from './shared';
import { SiteShell } from './SiteShell';

type ServicePageProps = {
  offerId: string;
  description: string;
};

export function ServicePage({ offerId, description }: ServicePageProps) {
  const offer = offers.find((item) => item.id === offerId);
  if (!offer) throw new Error(`Unknown service: ${offerId}`);

  return (
    <SiteShell>
      <section className="service-hero">
        <div className="container">
          <p className="hero-badge"><span aria-hidden="true">●</span>Service {offer.number}</p>
          <h1>{offer.name}</h1>
          <p>{description}</p>
          <div className="button-row">
            <Link className="button button-growth" href="/visibility-check">Get a free visibility check <Arrow /></Link>
            <a className="button button-ghost" href="#pricing">See pricing</a>
          </div>
        </div>
      </section>
      <section className="offer-block service-offer" aria-labelledby={`${offer.id}-title`}>
        <OfferPanel offer={offer} headingLevel="h2" />
      </section>
      <section className="included-section" aria-labelledby="included-title">
        <div className="container">
          <h2 id="included-title">What&apos;s included</h2>
          <div className="included-grid">
            {offer.details.map((item) => (
              <article key={item.title}>
                <span aria-hidden="true">✓</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <HowItWorks />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </SiteShell>
  );
}
