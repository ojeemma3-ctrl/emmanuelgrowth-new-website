import Link from 'next/link';
import type { ReactNode } from 'react';
import { CONTACT_TOPICS } from '../../lib/check-config';
import { plans } from '../../lib/pricing-config';
import { FAQ, type FaqItem } from './FAQ';
import { FinalCTA } from './FinalCTA';
import { HowItWorks } from './HowItWorks';
import { ContactTrigger } from './InteractionTriggers';
import { PlanCard } from './Pricing';
import { SiteShell } from './SiteShell';

// Service pages in the home page design. The hero section uses the class "hero" so the home page styles
// (palette, sections, cards, flat buttons) apply here too; "svc-hero" makes it shorter, with no dashboard.
// Primary action: the free visibility check. Secondary: a free personal review (the site's contact box).
// "What's included" comes from lib/pricing-config.ts; nothing about the plan is restated by hand.

const Check = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>
);

export type ServicePageProps = {
  planId: string;
  kicker: string;
  title: string;
  description: string;
  visual: ReactNode; // a small example graphic, labelled "Example"
  points: string[]; // what it does: 3 short points
  pointsTitle?: string;
  faqs: FaqItem[];
  closingHeading: string;
  children?: ReactNode; // extra sections after "What it does"
};

export function ServicePage({ planId, kicker, title, description, visual, points, pointsTitle = 'What it does', faqs, closingHeading, children }: ServicePageProps) {
  const plan = plans.find((p) => p.id === planId);
  if (!plan) throw new Error(`Unknown plan: ${planId}`);
  return (
    <SiteShell>
      <section className="hero svc-hero" id="top">
        <div className="container svc-hero-grid">
          <div className="hero-copy">
            <p className="hero-badge"><span aria-hidden="true">●</span>{kicker}</p>
            <h1>{title}</h1>
            <p>{description}</p>
            <div className="button-row">
              <Link className="button button-growth hero-cta" href="/visibility-check">
                Get a free visibility check
                <span className="hero-cta-icon" aria-hidden="true">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8h9M8.5 4l4 4-4 4" /></svg>
                </span>
              </Link>
              <ContactTrigger className="button svc-secondary" topic={CONTACT_TOPICS.personalReview}>Get a free personal review</ContactTrigger>
            </div>
          </div>
          <figure className="svc-visual">
            <div className="svc-visual-card">{visual}</div>
            <figcaption>Example</figcaption>
          </figure>
        </div>
      </section>

      <section className="svc-section" aria-labelledby="svc-points-title">
        <div className="container">
          <h2 id="svc-points-title">{pointsTitle}</h2>
          <ul className="svc-points">
            {points.map((point) => <li key={point}><span aria-hidden="true"><Check /></span>{point}</li>)}
          </ul>
        </div>
      </section>

      {children}

      <HowItWorks />

      <section className="svc-section svc-included" id="included" aria-labelledby="svc-included-title">
        <div className="container svc-included-grid">
          <div>
            <h2 id="svc-included-title">What&apos;s included</h2>
            <ul className="svc-checklist">
              {plan.features.map((item) => <li key={item}><span aria-hidden="true"><Check /></span>{item}</li>)}
            </ul>
            <div className="svc-fine">{plan.finePrint.map((line) => <p key={line}>{line}</p>)}</div>
          </div>
          <PlanCard plan={plan} showDetails={false} />
        </div>
      </section>

      <FAQ items={faqs} intro="Something else on your mind? Ask for a free personal review." />
      <FinalCTA heading={closingHeading} />
    </SiteShell>
  );
}
