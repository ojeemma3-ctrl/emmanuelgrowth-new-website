import Link from 'next/link';
import type { ReactNode } from 'react';
import { CONTACT_TOPICS } from '../../lib/check-config';
import { includedLines } from '../../lib/included-lines';
import { nigeriaNote, plans, type Plan } from '../../lib/pricing-config';
import { FAQ, type FaqItem } from './FAQ';
import { FinalCTA } from './FinalCTA';
import { HowItWorks, type HowStep } from './HowItWorks';
import { ContactTrigger } from './InteractionTriggers';
import { PlanCard } from './Pricing';
import { SiteShell } from './SiteShell';

// One template for the four service pages (/get-found, /get-more-reviews, /convert-enquiries, /complete-system).
// Sections, in order: hero with an example graphic, Why it matters, What you get, (optional extra section),
// How it works (the service's own steps),
// Who it's for / What this is not, the plan card, FAQ, closing call to action.
// Plans, prices, terms and the "What you get" items come from lib/pricing-config.ts; the line under each item
// comes from lib/included-lines.ts. Nothing about a plan is restated by hand. The hero uses the class "hero"
// so the home page styles apply; "svc-hero" sets its height and layout (see "Service pages" in globals.css).

const Check = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>
);
const Cross = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m4.5 4.5 7 7M11.5 4.5l-7 7" /></svg>
);

export type IncludedGroup = { title: string; features: string[] };

export type ServicePageProps = {
  planId: string;
  kicker: string;
  title: string;
  description: string;
  visual: ReactNode; // the matching home tab graphic, shown with an "Example" caption
  wide?: boolean; // hero visual is the three graphics together (Complete system)
  why: { title: string; text: string }[]; // 3 to 4 blocks
  included: IncludedGroup[]; // every feature of the plan (or of the plans it bundles), grouped
  afterIncluded?: ReactNode; // an extra section right after "What you get" (Get Found: the custom website offer)
  how: { title: string; steps: HowStep[]; note?: string }; // what happens for the business's customers, 3 or 4 steps
  forWho: string[];
  notThis: string[];
  faqs: FaqItem[]; // 6 to 8; also published as FAQPage structured data, from the same text
  closingHeading: string;
};

const planById = (id: string) => {
  const plan = plans.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
};

// "Everything in Get Found" → the Get Found plan. Used by the Complete system.
const bundledPlan = (feature: string) => plans.find((p) => feature === `Everything in ${p.name}`);

// The features the page must list: the plan's own, or for a bundle, the features of each plan it includes.
function featuresToList(plan: Plan) {
  return plan.features.flatMap((f) => bundledPlan(f)?.features ?? [f]);
}

// Build-time check: "What you get" lists exactly the plan's features from the pricing config, each with a line.
function checkIncluded(plan: Plan, groups: IncludedGroup[]) {
  const shown = groups.flatMap((g) => g.features);
  const expected = featuresToList(plan);
  const missing = expected.filter((f) => !shown.includes(f));
  const extra = shown.filter((f) => !expected.includes(f));
  const noLine = shown.filter((f) => !includedLines[f]);
  if (missing.length || extra.length || noLine.length) {
    throw new Error(`Service page "${plan.id}": features must match lib/pricing-config.ts. Missing: ${missing.join('; ') || 'none'}. Not in config: ${extra.join('; ') || 'none'}. No line in lib/included-lines.ts: ${noLine.join('; ') || 'none'}.`);
  }
}

const jumpLinks = [
  { title: 'Why it matters', line: 'The simple reasons', href: '#why' },
  { title: 'What you get', line: 'Everything included', href: '#included' },
  { title: 'Price', line: 'Plan and terms', href: '#plan' },
  { title: 'Questions', line: 'Short answers', href: '#faq' },
];

export function ServicePage({ planId, kicker, title, description, visual, wide = false, why, included, afterIncluded, how, forWho, notThis, faqs, closingHeading }: ServicePageProps) {
  const plan = planById(planId);
  checkIncluded(plan, included);
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
  };

  return (
    <SiteShell>
      <section className={`hero svc-hero${wide ? ' is-wide' : ''}`} id="top">
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
        <nav className="container hero-boxes svc-jump" aria-label="On this page">
          {jumpLinks.map((box) => (
            <a key={box.href} href={box.href}>
              <strong>{box.title}</strong>
              <span>{box.line}</span>
            </a>
          ))}
        </nav>
      </section>

      <section className="svc-section svc-why" id="why" aria-labelledby="svc-why-title">
        <div className="container">
          <p className="svc-kicker">Why it matters</p>
          <h2 id="svc-why-title">Why it matters for a local business</h2>
          <ul className={`svc-why-grid is-${why.length}`}>
            {why.map((item, i) => (
              <li key={item.title}>
                <span className="svc-num" aria-hidden="true">{i + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="svc-section svc-included" id="included" aria-labelledby="svc-included-title">
        <div className="container">
          <p className="svc-kicker">What you get</p>
          <h2 id="svc-included-title">Everything included in {plan.name}</h2>
          <div className="svc-groups">
            {included.map((group) => (
              <div className="svc-group" key={group.title}>
                <h3>{group.title}</h3>
                <ul>
                  {group.features.map((feature) => (
                    <li key={feature}>
                      <span className="svc-tick" aria-hidden="true"><Check /></span>
                      <div><strong>{feature}</strong><p>{includedLines[feature]}</p></div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {afterIncluded}

      <HowItWorks title={how.title} steps={how.steps} note={how.note} />

      <section className="svc-section svc-fit" aria-labelledby="svc-fit-title">
        <div className="container">
          <h2 id="svc-fit-title" className="sr-only">Who it is for, and what it is not</h2>
          <div className="svc-fit-grid">
            <div className="svc-fit-col">
              <h3>Who it’s for</h3>
              <ul>{forWho.map((line) => <li key={line}><span className="svc-tick" aria-hidden="true"><Check /></span>{line}</li>)}</ul>
            </div>
            <div className="svc-fit-col is-not">
              <h3>What this is not</h3>
              <ul>{notThis.map((line) => <li key={line}><span className="svc-cross" aria-hidden="true"><Cross /></span>{line}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      <section className="svc-section svc-plan" id="plan" aria-labelledby="svc-plan-title">
        <div className="container svc-plan-grid">
          <div className="svc-plan-copy">
            <p className="svc-kicker">Price</p>
            <h2 id="svc-plan-title">{plan.name} pricing</h2>
            <div className="svc-fine">
              {plan.finePrint.map((line) => <p key={line}>{line}</p>)}
              <p>Prices are in euros. {nigeriaNote}</p>
            </div>
          </div>
          <PlanCard plan={plan} anchor={false} showDetails={false} />
        </div>
      </section>

      <FAQ items={faqs} intro="Something else on your mind? Ask for a free personal review." />
      <FinalCTA heading={closingHeading} />
      {/* Same questions and answers as the FAQ above. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData).replace(/</g, '\\u003c') }} />
    </SiteShell>
  );
}
