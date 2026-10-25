import Link from 'next/link';
import { CONTACT_TOPICS } from '../../lib/check-config';
import { nigeriaNote, plans, type Plan, pricingCopy, setupFeeText, showEarlyClientNote } from '../../lib/pricing-config';
import { ContactTrigger } from './InteractionTriggers';
import { Arrow } from './shared';

// Prices, terms, labels and links all come from lib/pricing-config.ts.
// Anchors: /#pricing for the section, /#<plan id>-plan for each card.
// variant 'home': centred cards on white with one note under them; the service pages use the default layout.
export function Pricing({ variant = 'default' }: { variant?: 'default' | 'home' }) {
  return variant === 'home' ? <HomePricing /> : <DefaultPricing />;
}

function DefaultPricing() {
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

// Home layout. Same plans, prices, text and links; the fine print moves into one note under the cards.
const ROWS = 4; // feature rows per card; shorter lists get blank rows so the cards line up
const priceNumber = (price: string) => price.replace(/^From\s+/i, '');
const periodText = (period: string) => period.replace(/^\//, 'per ');
const minimumTerm = (lines: string[]) => {
  const text = lines.join(' ');
  return /3-month minimum/i.test(text) ? '3-month minimum' : /month to month/i.test(text) ? 'Month to month' : null;
};
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function HomePricing() {
  const { heading, intro, earlyClientNote } = pricingCopy;
  const usagePlans = plans.filter((p) => p.status === 'early-access').map((p) => p.name).join(' and ');
  return (
    <section className="pricing-section pricing-home" id="pricing">
      <div className="container">
        <div className="pricing-heading">
          <p className="kicker">Pricing</p>
          <h2>{heading}</h2>
          <p>{intro}{showEarlyClientNote ? ` ${earlyClientNote}` : ''}</p>
        </div>
        <div className="ph-grid">
          {plans.map((plan) => <PlanCard plan={plan} key={plan.id} />)}
        </div>
        <p className="ph-note">{usagePlans}: {lowerFirst(setupFeeText)}. AI and messaging usage is billed separately, based on how many messages you receive. Prices are in euros. {nigeriaNote}</p>
        <p className="ph-note ph-note-website">Need a full custom website, 5 to 10 pages? <ContactTrigger className="ph-note-link" topic={CONTACT_TOPICS.websiteImprovements}>Tell me what you need</ContactTrigger> and I will quote it.</p>
      </div>
    </section>
  );
}

// One plan card in the home style; also used on the service pages. Text, prices and links from pricing-config.
// On a plan's own page, pass showDetails={false} so the card doesn't link to the page it is on.
export function PlanCard({ plan, anchor = true, showDetails = true }: { plan: Plan; anchor?: boolean; showDetails?: boolean }) {
  const label = plan.status === 'early-access' ? 'From · early access' : plan.billingNote;
  const minimum = minimumTerm(plan.finePrint);
  return (
    <article className={`ph-card${plan.highlighted ? ' is-featured' : ''}`} id={anchor ? `${plan.id}-plan` : undefined} aria-labelledby={`${plan.id}-plan-title`}>
      {plan.highlighted ? <span className="ph-ribbon">Everything included</span> : null}
      <h3 className="ph-name" id={`${plan.id}-plan-title`}>{plan.name}</h3>
      {label ? <p className="ph-label">{label}</p> : null}
      <p className="ph-price">{priceNumber(plan.price)}</p>
      <p className="ph-period">{periodText(plan.period)}</p>
      <p className="ph-for">{plan.forWho}</p>
      <ul className="ph-features">
        {Array.from({ length: Math.max(ROWS, plan.features.length) }, (_, i) => plan.features[i]).map((item, i) => (
          <li key={item ?? `blank-${i}`} aria-hidden={item ? undefined : true}>{item ?? ''}</li>
        ))}
      </ul>
      {minimum ? <p className="ph-minimum">{minimum}</p> : null}
      <ContactTrigger className="ph-button" topic={plan.contactTopic}>{plan.primaryLabel} <Arrow /></ContactTrigger>
      {showDetails ? <Link className="ph-details" href={plan.detailsHref}>{plan.detailsLabel}<span className="sr-only"> for {plan.name}</span></Link> : null}
    </article>
  );
}
