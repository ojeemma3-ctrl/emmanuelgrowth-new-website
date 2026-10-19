import Link from 'next/link';
import { plans, pricingCopy, showEarlyClientNote } from '../../lib/pricing-config';
import { ContactTrigger } from './InteractionTriggers';
import { Arrow } from './shared';

// Prices, terms, labels and links all come from lib/pricing-config.ts.
// Anchors: /#pricing for the section, /#<plan id>-plan for each card.
export function Pricing() {
  const { heading, headingHighlight, intro, earlyClientNote, footNote } = pricingCopy;
  return (
    <section className="pricing-section" id="pricing">
      <div className="container">
        <div className="pricing-heading">
          <p className="kicker">Pricing</p>
          <h2>{heading.split(headingHighlight).flatMap((part, i) => (i === 0 ? [part] : [<em key={i}>{headingHighlight}</em>, part]))}</h2>
          <p>{intro}{showEarlyClientNote ? ` ${earlyClientNote}` : ''}</p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article className={`price-card${plan.highlighted ? ' is-highlighted' : ''}`} id={`${plan.id}-plan`} key={plan.id} aria-labelledby={`${plan.id}-plan-title`}>
              <div className="price-card-head">
                <h3 id={`${plan.id}-plan-title`}>{plan.name}</h3>
                {plan.status === 'early-access' ? <span className="price-tag">Early access</span> : null}
              </div>
              <p className="price-amount"><strong>{plan.price}</strong><span>{plan.period}</span></p>
              {plan.billingNote ? <p className="price-billing">{plan.billingNote}</p> : null}
              <p className="price-for">{plan.forWho}</p>
              <ul className="price-includes">
                {plan.features.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
              </ul>
              <div className="price-fine">{plan.finePrint.map((line) => <p key={line}>{line}</p>)}</div>
              <div className="price-actions">
                <ContactTrigger className={`button ${plan.highlighted ? 'button-growth' : 'button-dark'} price-button`} topic={plan.contactTopic}>{plan.primaryLabel} <Arrow /></ContactTrigger>
                <Link className="price-details" href={plan.detailsHref}>{plan.detailsLabel}<span className="sr-only"> for {plan.name}</span></Link>
              </div>
            </article>
          ))}
        </div>
        <p className="pricing-note">{footNote}</p>
      </div>
    </section>
  );
}
